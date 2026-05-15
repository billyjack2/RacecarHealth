import "server-only";
import { auth } from "@clerk/nextjs/server";
import { queries } from "@racecarhealth/db";

/**
 * Resolve the internal `team_id` UUID for the current request.
 *
 * THIS IS THE ONE AND ONLY SANCTIONED WAY to obtain a teamId in route
 * handlers and server actions. Every team-scoped query in `packages/db`
 * takes teamId as its first arg; bypassing this helper means bypassing
 * row-level isolation.
 *
 * Behaviour:
 * - Not signed in → throws `TenancyError("not_signed_in")`.
 * - Signed in but no Org selected → throws `TenancyError("no_org_selected")`.
 *   The caller should redirect to the Org switcher.
 * - Org selected but no matching `teams` row exists yet → upserts one
 *   from the Clerk org metadata and returns its id. This lets a brand
 *   new Clerk Org transparently provision a team on first access.
 */
export class TenancyError extends Error {
  constructor(
    public code: "not_signed_in" | "no_org_selected" | "team_lookup_failed",
    message?: string,
  ) {
    super(message ?? code);
    this.name = "TenancyError";
  }
}

export async function getTeamId(): Promise<string> {
  const { userId, orgId, orgSlug, sessionClaims } = await auth();
  if (!userId) throw new TenancyError("not_signed_in");
  if (!orgId) throw new TenancyError("no_org_selected");

  const existing = await queries.getTeamByClerkOrgId(orgId);
  if (existing) return existing.id;

  // Best available name at first-touch. The Clerk webhook handler
  // (api/webhooks/clerk) is the source of truth for keeping it current.
  const claimedName =
    typeof sessionClaims?.org_name === "string"
      ? sessionClaims.org_name
      : undefined;
  const name = claimedName ?? orgSlug ?? orgId;

  // upsertTeam uses ON CONFLICT DO UPDATE which always RETURNING a row.
  const [created] = await queries.upsertTeam({ clerkOrgId: orgId, name });
  // Belt-and-braces: this branch should be unreachable. If it ever fires
  // it means Postgres returned an empty RETURNING from an upsert.
  if (!created) throw new TenancyError("team_lookup_failed");
  return created.id;
}
