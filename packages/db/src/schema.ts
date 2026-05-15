import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  foreignKey,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Teams == Clerk Organizations. The bridge table between Clerk's identity
// world and our row-level tenancy column (`team_id`). Every other table
// carries `team_id NOT NULL` and is queried through helpers that require a
// teamId argument — see ./queries.ts.
// ---------------------------------------------------------------------------
export const teams = pgTable(
  "teams",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    clerkOrgId: text("clerk_org_id").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("teams_clerk_org_id_uq").on(t.clerkOrgId)],
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    clerkUserId: text("clerk_user_id").notNull(),
    email: text("email").notNull(),
    role: text("role").notNull().default("member"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("users_team_id_idx").on(t.teamId),
    // The composite unique users_team_clerk_user_uq covers single-column
    // lookups by team_id (leftmost prefix). A separate single-column index
    // on clerk_user_id would only help global lookups across all teams —
    // we don't have those code paths.
    uniqueIndex("users_team_clerk_user_uq").on(t.teamId, t.clerkUserId),
  ],
);

// CarType — pure template owned by a team. The composite unique index
// (team_id, id) backs the cross-tenant FK from `cars` below.
export const carTypes = pgTable(
  "car_types",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    channelList: jsonb("channel_list").notNull().default(sql`'[]'::jsonb`),
    checkDefs: jsonb("check_defs").notNull().default(sql`'[]'::jsonb`),
    dashboardLayout: jsonb("dashboard_layout")
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("car_types_team_id_idx").on(t.teamId),
    // Targets the composite FK on cars(team_id, car_type_id).
    uniqueIndex("car_types_team_id_id_uq").on(t.teamId, t.id),
  ],
);

// Cars. The composite FK (team_id, car_type_id) → car_types(team_id, id)
// guarantees a car's CarType lives in the SAME team — DB-enforced cross-
// tenant integrity, not just app-side discipline.
export const cars = pgTable(
  "cars",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    carTypeId: uuid("car_type_id").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("cars_team_id_idx").on(t.teamId),
    index("cars_car_type_id_idx").on(t.carTypeId),
    uniqueIndex("cars_team_id_id_uq").on(t.teamId, t.id),
    foreignKey({
      columns: [t.teamId, t.carTypeId],
      foreignColumns: [carTypes.teamId, carTypes.id],
      name: "cars_car_type_same_team_fk",
    }).onDelete("restrict"),
  ],
);

// Sessions. Composite FK ensures the car lives in the same team.
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    carId: uuid("car_id").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("sessions_team_id_idx").on(t.teamId),
    index("sessions_car_id_idx").on(t.carId),
    // Backs a future composite FK from files(team_id, session_id) when
    // session bucketing lands; index it now so the schema migration is
    // additive (no rewrite of the sessions table).
    uniqueIndex("sessions_team_id_id_uq").on(t.teamId, t.id),
    foreignKey({
      columns: [t.teamId, t.carId],
      foreignColumns: [cars.teamId, cars.id],
      name: "sessions_car_same_team_fk",
    }).onDelete("restrict"),
    check(
      "sessions_time_order_ck",
      sql`ended_at IS NULL OR started_at IS NULL OR ended_at >= started_at`,
    ),
  ],
);

// Files. dataSource is the multi-format hook (CLAUDE.md): defaults to
// 'gems' for v1; AiM/MoTeC adapters just write a different value here.
// blobUrl is uniquely indexed so onUploadCompleted retries are idempotent.
export const files = pgTable(
  "files",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    sessionId: uuid("session_id").references(() => sessions.id, {
      onDelete: "set null",
    }),
    blobUrl: text("blob_url").notNull(),
    originalFilename: text("original_filename").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    dataSource: text("data_source").notNull().default("gems"),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("files_team_id_idx").on(t.teamId),
    index("files_session_id_idx").on(t.sessionId),
    uniqueIndex("files_blob_url_uq").on(t.blobUrl),
  ],
);

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type User = typeof users.$inferSelect;
export type CarType = typeof carTypes.$inferSelect;
export type Car = typeof cars.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type FileRow = typeof files.$inferSelect;
