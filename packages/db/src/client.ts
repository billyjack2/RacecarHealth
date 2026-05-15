import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// ---------------------------------------------------------------------------
// Lazy DB client.
//
// Next.js' build phase imports every route handler to collect its metadata
// (runtime, dynamic, headers). That transitively imports this module. If
// we created the postgres() client at module-load time we'd require
// POSTGRES_URL to be present *during the build*, which is wrong on two
// counts:
//   1. Builds should be reproducible without runtime secrets.
//   2. Vercel's first preview build runs before the Postgres integration
//      has populated env vars — chicken-and-egg failure.
//
// The Proxy below defers everything until the first `db.<something>` call.
// Module evaluation is now side-effect-free.
//
// postgres-js with `prepare: false` is required for the pgbouncer
// transaction-pool that fronts Vercel Postgres' pooled URL.
//
// In Next.js dev, HMR re-evaluates server modules on every save. The
// globalThis cache prevents per-save connection leaks.
// ---------------------------------------------------------------------------

type Db = PostgresJsDatabase<typeof schema>;

let _db: Db | undefined;

function ensureDb(): Db {
  if (_db) return _db;
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error(
      "POSTGRES_URL is not set. " +
        "Set it to the POOLED Vercel Postgres connection string (?pgbouncer=true).",
    );
  }
  const globalForDb = globalThis as unknown as {
    __racecarhealth_pg?: postgres.Sql;
  };
  const client =
    globalForDb.__racecarhealth_pg ??
    postgres(connectionString, { prepare: false });
  if (process.env.NODE_ENV !== "production") {
    globalForDb.__racecarhealth_pg = client;
  }
  _db = drizzle(client, { schema });
  return _db;
}

export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(ensureDb() as object, prop, receiver);
  },
});

export type DB = Db;
export { schema };
