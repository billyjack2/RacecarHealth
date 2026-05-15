import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error(
    "POSTGRES_URL is not set. " +
      "Set it to the POOLED Vercel Postgres connection string (?pgbouncer=true).",
  );
}

// postgres-js with `prepare: false` is required when the URL points at
// a pgbouncer transaction-pool — prepared statements break across pool
// hops. Vercel Postgres' pooled URL is always pgbouncer-fronted.
//
// In Next.js dev, HMR re-evaluates server modules on every save. Without
// the globalThis cache, each save creates a new postgres client + pool
// and the old one's connections leak until they hit the pool's idle
// timeout — exhausting the DB's connection limit after ~10 saves.
const globalForDb = globalThis as unknown as {
  __racecarhealth_pg?: postgres.Sql;
};

const client =
  globalForDb.__racecarhealth_pg ??
  postgres(connectionString, { prepare: false });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__racecarhealth_pg = client;
}

export const db = drizzle(client, { schema });
export type DB = typeof db;
export { schema };
