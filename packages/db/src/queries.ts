import { and, eq, sql } from "drizzle-orm";
import { db } from "./client";
import { cars, carTypes, files, sessions, teams, users } from "./schema";

// --- infra ----------------------------------------------------------------
// SELECT 1. Used by /api/health for liveness + DB reachability.
export function ping() {
  return db.execute(sql`select 1`);
}

// ---------------------------------------------------------------------------
// Tenancy boundary.
//
// EVERY query against a team-scoped table MUST go through one of these
// helpers, and EVERY helper takes `teamId` as its first argument. The
// helper bakes `team_id = $1` into the SQL so a caller cannot accidentally
// read or write across tenants.
//
// New helpers MUST follow the same shape:
//   export function fooByTeam(teamId: string, ...rest) { ... }
//
// Direct use of `db.select().from(<table>)` for any table other than
// `teams` is a tenancy violation. There is no automated lint rule for
// this yet — reviewers must catch it manually until one is added.
// ---------------------------------------------------------------------------

// teams is the *only* table queried by Clerk org id, not team_id —
// it's the lookup that produces the team_id everything else uses.
export function getTeamByClerkOrgId(clerkOrgId: string) {
  return db.query.teams.findFirst({
    where: eq(teams.clerkOrgId, clerkOrgId),
  });
}

export function upsertTeam(input: {
  clerkOrgId: string;
  name: string;
}) {
  return db
    .insert(teams)
    .values(input)
    .onConflictDoUpdate({
      target: teams.clerkOrgId,
      set: { name: input.name, updatedAt: new Date() },
    })
    .returning();
}

export function deleteTeamByClerkOrgId(clerkOrgId: string) {
  return db.delete(teams).where(eq(teams.clerkOrgId, clerkOrgId)).returning();
}

/**
 * Atomically collect every blob_url for a team's files, then delete the
 * team (cascade kills files/sessions/cars/users/car_types).
 *
 * Returns the captured blob URLs so the caller can `del()` them against
 * Vercel Blob. The collect-then-delete order matters: once the cascade
 * fires, the file rows are gone and there is no recovery path. If the
 * subsequent blob deletion fails, the URLs are still returned for manual
 * or queued cleanup — the cost of failure is leaked storage, not data
 * loss.
 */
export async function deleteTeamAndCollectBlobUrls(
  clerkOrgId: string,
): Promise<{ teamDeleted: boolean; blobUrls: string[] }> {
  return db.transaction(async (tx) => {
    const team = await tx.query.teams.findFirst({
      where: eq(teams.clerkOrgId, clerkOrgId),
    });
    if (!team) return { teamDeleted: false, blobUrls: [] };

    const urls = await tx
      .select({ blobUrl: files.blobUrl })
      .from(files)
      .where(eq(files.teamId, team.id));

    await tx.delete(teams).where(eq(teams.id, team.id));

    return {
      teamDeleted: true,
      blobUrls: urls.map((u) => u.blobUrl),
    };
  });
}

// --- users (webhook-driven) ----------------------------------------------
export function upsertUserMembership(input: {
  teamId: string;
  clerkUserId: string;
  email: string;
  role: string;
}) {
  return db
    .insert(users)
    .values(input)
    .onConflictDoUpdate({
      target: [users.teamId, users.clerkUserId],
      set: {
        email: input.email,
        role: input.role,
        updatedAt: new Date(),
      },
    })
    .returning();
}

export function deleteUserMembership(input: {
  teamId: string;
  clerkUserId: string;
}) {
  return db
    .delete(users)
    .where(
      and(
        eq(users.teamId, input.teamId),
        eq(users.clerkUserId, input.clerkUserId),
      ),
    )
    .returning();
}

// --- car_types ------------------------------------------------------------
export function listCarTypes(teamId: string) {
  return db.select().from(carTypes).where(eq(carTypes.teamId, teamId));
}

export function getCarType(teamId: string, carTypeId: string) {
  return db.query.carTypes.findFirst({
    where: and(eq(carTypes.teamId, teamId), eq(carTypes.id, carTypeId)),
  });
}

// --- cars -----------------------------------------------------------------
export function listCars(teamId: string) {
  return db.select().from(cars).where(eq(cars.teamId, teamId));
}

export function getCar(teamId: string, carId: string) {
  return db.query.cars.findFirst({
    where: and(eq(cars.teamId, teamId), eq(cars.id, carId)),
  });
}

// --- sessions -------------------------------------------------------------
export function listSessions(teamId: string, carId?: string) {
  const where = carId
    ? and(eq(sessions.teamId, teamId), eq(sessions.carId, carId))
    : eq(sessions.teamId, teamId);
  return db.select().from(sessions).where(where);
}

// --- files ----------------------------------------------------------------
export function listFiles(teamId: string, sessionId?: string) {
  const where = sessionId
    ? and(eq(files.teamId, teamId), eq(files.sessionId, sessionId))
    : eq(files.teamId, teamId);
  return db.select().from(files).where(where);
}

// Idempotent insert: `files.blob_url` is uniquely indexed, so a retried
// onUploadCompleted callback no-ops instead of duplicating the row.
export function insertFile(input: {
  teamId: string;
  sessionId?: string | null;
  blobUrl: string;
  originalFilename: string;
  sizeBytes: number;
  dataSource?: string;
}) {
  return db
    .insert(files)
    .values(input)
    .onConflictDoNothing({ target: files.blobUrl })
    .returning();
}

// --- users ----------------------------------------------------------------
export function listTeamMembers(teamId: string) {
  return db.select().from(users).where(eq(users.teamId, teamId));
}
