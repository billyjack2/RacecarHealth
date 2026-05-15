import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { del } from "@vercel/blob";
import { queries } from "@/lib/db";

// Clerk → our DB mirror. Without this, a Clerk Org or membership that is
// deleted in Clerk's dashboard leaves rows behind here forever (and Vercel
// Blob objects unreferenced).
//
// Configure the matching webhook endpoint in the Clerk dashboard at
// /webhooks → "Add Endpoint" → URL: <prod-url>/api/webhooks/clerk.
// Subscribe to:
//   - organization.created, organization.updated, organization.deleted
//   - organizationMembership.created, .updated, .deleted
// Copy the signing secret into CLERK_WEBHOOK_SECRET.

type EmailEntry = { id: string; email_address: string };

type ClerkEvent =
  | {
      type: "organization.created" | "organization.updated";
      data: { id: string; name?: string; slug?: string };
    }
  | {
      type: "organization.deleted";
      data: { id: string; deleted: true };
    }
  | {
      type:
        | "organizationMembership.created"
        | "organizationMembership.updated";
      data: {
        organization: { id: string };
        public_user_data: {
          user_id: string;
          identifier?: string;
        };
        role: string;
      };
    }
  | {
      type: "organizationMembership.deleted";
      data: {
        organization: { id: string };
        public_user_data: { user_id: string };
      };
    };

export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CLERK_WEBHOOK_SECRET not configured" },
      { status: 500 },
    );
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "missing_svix_headers" },
      { status: 400 },
    );
  }

  const payload = await req.text();
  let event: ClerkEvent;
  try {
    event = new Webhook(secret).verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkEvent;
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  switch (event.type) {
    case "organization.created":
    case "organization.updated": {
      const { id, name, slug } = event.data;
      await queries.upsertTeam({
        clerkOrgId: id,
        name: name ?? slug ?? id,
      });
      break;
    }
    case "organization.deleted": {
      // Capture blob URLs inside the deleting transaction, then drop the
      // blobs after the DB commit. If the blob delete fails, we've leaked
      // storage but not lost the audit trail — the org is gone either way.
      const { teamDeleted, blobUrls } =
        await queries.deleteTeamAndCollectBlobUrls(event.data.id);
      if (teamDeleted && blobUrls.length > 0) {
        try {
          await del(blobUrls);
        } catch (err) {
          // Don't 5xx — Clerk will retry the webhook and we'd just re-
          // attempt deletion of an already-deleted team. Log for manual
          // cleanup instead.
          console.error("blob cleanup failed for deleted org", {
            clerkOrgId: event.data.id,
            blobCount: blobUrls.length,
            error: err instanceof Error ? err.message : err,
          });
        }
      }
      break;
    }
    case "organizationMembership.created":
    case "organizationMembership.updated": {
      // Svix delivers webhooks at-least-once and CAN deliver out of order.
      // If membership arrives before organization.created, naively bailing
      // would 200-ack the event and Svix would never retry it — the
      // founding member's `users` row would be silently lost. Instead,
      // proactively upsert a stub `teams` row; the subsequent
      // organization.created/updated webhook overwrites the name.
      const clerkOrgId = event.data.organization.id;
      const team =
        (await queries.getTeamByClerkOrgId(clerkOrgId)) ??
        (await queries.upsertTeam({
          clerkOrgId,
          name: clerkOrgId,
        }))[0];
      if (!team) throw new Error("team upsert returned no row");
      await queries.upsertUserMembership({
        teamId: team.id,
        clerkUserId: event.data.public_user_data.user_id,
        email: event.data.public_user_data.identifier ?? "",
        role: event.data.role,
      });
      break;
    }
    case "organizationMembership.deleted": {
      // No team → nothing to delete. Safe to ack.
      const team = await queries.getTeamByClerkOrgId(
        event.data.organization.id,
      );
      if (!team) break;
      await queries.deleteUserMembership({
        teamId: team.id,
        clerkUserId: event.data.public_user_data.user_id,
      });
      break;
    }
    default: {
      // Unknown event types are acked so Svix doesn't retry them forever.
      // We intentionally subscribe to a subset of Clerk events.
      break;
    }
  }

  return NextResponse.json({ ok: true });
}
