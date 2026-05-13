# RaceCarHealth

Multi-tenant SaaS for race-car telemetry health-checks. Teams upload
GEMS CSV exports, run configurable checks against them, and view
results in a live dashboard plus exportable PDF/HTML reports.

## Status

Pre-code. Decisions locked, PRD pending. See `CLAUDE.md` for the
working context and locked tech/domain decisions.

Next steps:

1. **Author the PRD** via `/to-prd` using the planning doc as input.
2. **Break PRD into issues** via `/to-issues`.
3. **Build** following the MVP sequence in the planning doc.

## Stack

- **App**: Next.js (App Router) on Vercel
- **Auth**: Clerk (Organizations as Teams)
- **DB**: Vercel Postgres
- **Blobs**: Vercel Blob
- **Analysis engine**: Python on Modal, behind Inngest for durability

## Input format

v1 accepts **GEMS CSV exports** only. Additional vendors (AiM, MoTeC,
…) drop in later by adding channel mappings — no engine changes.

## Quickstart for contributors

Clone the repo, open Claude Code in this directory, then register the
skill marketplaces we depend on:

```
/plugin marketplace add mattpocock/skills
/plugin marketplace add nimrodfisher/data-analytics-skills
```

Then bootstrap the agent docs (creates `docs/agents/` and updates
`CLAUDE.md`):

```
/setup-matt-pocock-skills
```

## Planned modules (post-PRD)

- `apps/web/` — Next.js app: dashboard, upload UI, check authoring,
  report export
- `services/analysis/` — Python on Modal: GEMS CSV parser, channel
  mapping application, check engine
- `packages/shared/` — TypeScript types shared between Next.js and the
  Modal callback contract
- v2: `apps/agent/` — local file-watcher that auto-uploads new CSVs
