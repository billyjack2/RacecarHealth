# RaceCarHealth

Multi-tenant SaaS for race-car telemetry health checks. Teams upload
GEMS CSV exports, run configurable checks against them, and review
results in a per-session dashboard plus exportable reports.

v1 ingests **GEMS CSV** only. Additional vendors (AiM, MoTeC, …) drop
in later as new `(CarType, DataSource)` mappings — no engine changes.

## Status

Early build. The Next.js app shell, Clerk-backed multi-tenancy, the
Drizzle schema (teams / users / car types / cars / sessions / files),
and Vercel Blob upload URLs are wired up. The Python analysis engine
on Modal and the in-app check authoring UI are still to come.

See `CLAUDE.md` for the locked stack and domain decisions, and
`docs/prd.md` for the (stub) PRD.

## Stack

- **App shell**: Next.js 16 (App Router) — `apps/web`
- **Auth + tenancy**: Clerk (Organizations == Teams)
- **DB**: Vercel Postgres via Drizzle ORM — `packages/db`
- **Blob storage**: Vercel Blob (client-uploads with signed URLs)
- **Analysis engine** (planned): Python on Modal, fronted by Inngest
- **Deploy target**: Vercel
- **Monorepo**: pnpm workspaces + Turborepo

## Repo layout

```
apps/web/           Next.js app (UI, auth middleware, API routes,
                    Clerk webhook, Vercel Blob upload-url handler)
packages/db/        Drizzle schema, query helpers, generated migrations
ux/                 Static HTML/JS prototypes (design source of truth
                    for the look-and-feel; no build step)
docs/               PRD, ADRs, agent docs, session handoffs
CLAUDE.md           Locked product/tech decisions + working agreement
```

Every team-scoped table carries a `team_id NOT NULL` column. The only
sanctioned way to obtain one in a request is `getTeamId()` in
`apps/web/lib/team.ts` — bypassing it bypasses row-level isolation.

## Prerequisites

- **Node** ≥ 20
- **pnpm** 10 (`corepack enable` then `corepack prepare pnpm@10 --activate`,
  or install via your package manager)
- A **Postgres** database (Vercel Postgres in prod; any Postgres works
  locally — Neon, Supabase, a local container, etc.)
- A **Clerk** application with Organizations enabled
- A **Vercel Blob** store (only needed to exercise CSV upload locally)

## Local setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp packages/db/.env.example packages/db/.env
# create apps/web/.env.local with the variables listed below

# 3. Run database migrations
pnpm db:migrate

# 4. Start the dev server
pnpm dev
```

The app boots on http://localhost:3000.

### Environment variables

**`packages/db/.env`** — used by `drizzle-kit` only (migrations,
studio). Drizzle's DDL/advisory-lock patterns are incompatible with
pgbouncer's transaction-pooling mode, so this one uses the unpooled
URL:

```
POSTGRES_URL_NON_POOLING=postgres://user:pass@host/db?sslmode=require
```

**`apps/web/.env.local`** — runtime config for the Next.js app:

```
# Clerk (https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...

# Postgres — POOLED connection string for the serverless runtime
POSTGRES_URL=postgres://user:pass@host/db?sslmode=require&pgbouncer=true

# Vercel Blob (only required for CSV uploads)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

In Clerk, enable **Organizations** and point the webhook at
`/api/webhooks/clerk` (see "Webhooks" below for the local-dev tunnel).

### Useful scripts

From the repo root:

```bash
pnpm dev               # turbo run dev — starts apps/web
pnpm build             # turbo run build
pnpm lint              # ESLint across the workspace
pnpm typecheck         # tsc --noEmit across the workspace
pnpm db:generate       # drizzle-kit generate (write a new migration)
pnpm db:migrate        # drizzle-kit migrate  (apply pending migrations)
pnpm db:studio         # drizzle-kit studio   (DB browser at localhost:4983)
```

### Health check

`GET /api/health` returns `{ ok: true, db: "up", latencyMs }` if the
app can reach Postgres. Useful as a deploy smoke test.

### Webhooks (Clerk → app)

`/api/webhooks/clerk` keeps the local `teams` table in sync with Clerk
Organizations. For local dev, expose your dev server with a tunnel
(`ngrok http 3000`, `cloudflared tunnel`, etc.) and configure that URL
as the webhook endpoint in the Clerk dashboard. The handler verifies
Svix signatures, so the `CLERK_WEBHOOK_SIGNING_SECRET` must match.

## UX prototypes

`ux/` holds static HTML mocks that lock the visual direction (Variant
D — dark, amber accent, Inter + JetBrains Mono, hairline borders, no
rounded corners). Open any `.html` file directly in a browser — no
build step. See `ux/README.md` for the page index.

