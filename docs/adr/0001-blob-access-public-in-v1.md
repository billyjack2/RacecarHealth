---
status: accepted
date: 2026-05-15
---

# ADR 0001 — Uploaded CSVs use Vercel Blob `access: "public"` in v1

## Context

GEMS telemetry CSV files are uploaded by signed-in team members to
Vercel Blob from the dashboard. The `@vercel/blob/client.upload()`
flow we use (browser → signed token → direct browser → Blob upload)
only supports `access: "public"` as of `@vercel/blob` v2.3.x. The
server-side `put()` does support `access: "private"`, but server-side
uploads route through a Vercel serverless function and are subject to
the 4.5 MB request-body limit on the default runtime — a hard blocker
for GEMS sessions that can run 20–100 MB.

## Decision

In v1, uploaded CSVs are stored with `access: "public"` and
`addRandomSuffix: true`. Blob URLs are practically unguessable
(suffixed with cryptographically random tokens), but anyone holding
the URL can read the file without authentication.

We treat this as acceptable for v1 because:

- The MVP user base is a single design partner; no production
  customer data is in the system.
- Telemetry data is generally not regulated PII in motorsport.
- The signed URL with random suffix is not exposed in any UI yet.

## Consequences

Before any second team onboards or any "real" customer data lands,
this decision must be revisited and replaced with one of:

1. **Multipart client upload to private storage** — `@vercel/blob`
   supports multipart for large files; if it gains `access: "private"`
   for client-side multipart, use it.
2. **Server-side streaming upload via Edge runtime** — Edge has a
   higher body-size ceiling (~32 MB) and can `put({ access: "private" })`.
   Sufficient for typical GEMS sessions; not all.
3. **Pre-shared signed download URLs** — keep public storage but never
   return raw URLs to the client; serve through a proxy route that
   checks `team_id` membership before issuing a short-TTL redirect.

Option 3 is the lowest-effort upgrade path and the leading candidate.

## Status

Accepted for v1 scaffold. Reopen before any team beyond the design
partner is invited.
