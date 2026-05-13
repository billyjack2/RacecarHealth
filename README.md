# RaceCarHealth

Automated health-check and reporting toolkit for race-car CSV telemetry.

## Status

Bootstrapping. This repository is being set up in three steps:

1. **Install skills** (this commit) — register the Claude Code skill
   marketplaces we plan to use.
2. **Author a PRD** — drive out feature set, business cases, and
   reporting surfaces before any stack decisions.
3. **Build** — pick a web stack, scaffold modules, implement the
   analysis engine, dashboard, and local file-watcher agent.

See `CLAUDE.md` for the working context Claude sessions should load,
and (once written) `docs/prd.md` for the locked product spec.

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

From there, drive the PRD with `/to-prd` and break it into issues with
`/to-issues`.

## Planned modules (post-PRD)

- `racecarhealth/agent/` — local file-watcher that auto-uploads new
  CSV downloads into the system.
- `racecarhealth/core/` — CSV parsing (AiM + generic), channel model,
  and the health-check engine (pre-built + user-definable checks).
- `racecarhealth/web/` — dashboard for browsing sessions, viewing
  check results, and pulling reports.

## Branch policy

Active development lives on `claude/race-car-data-analysis-d9HFr`
until the PRD is approved and a default branch is established.
