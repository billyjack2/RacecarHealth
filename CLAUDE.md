# RaceCarHealth — Claude Context

This project analyzes race-car CSV telemetry logs, runs automated
health checks against them, and surfaces results through a web
dashboard and exportable reports. v2 adds a local agent that watches
a folder for newly downloaded logs and auto-uploads them.

## What's decided (locked 2026-05-13)

See `/Users/billyjack/.claude/plans/grill-me-and-lets-iridescent-ritchie.md`
for the full planning doc that drove these decisions.

### Stack
- **Frontend / app shell**: Next.js (App Router) on **Vercel**
- **Auth + multi-tenancy**: **Clerk** (Organizations == Teams)
- **DB**: **Vercel Postgres** (pooled connection string from day one)
- **Blob storage**: **Vercel Blob**
- **Python analysis engine**: **Modal** with **Inngest** in front as
  the durable trigger / retry layer. Modal POSTs results back to a
  Next.js callback route (single DB-credential boundary).

### Domain model
- **Team** (== Clerk Org) owns Users, Cars, CarTypes, Sessions
- **CarType** (team-scoped, pure template): canonical channel list +
  check definitions + dashboard layout. Edits propagate to every Car
  of that type.
- **Car**: instance of a CarType. A team can have many cars of the
  same type.
- **ReportObject** (channel mapping): defaults at (CarType,
  DataSource), Car-level overrides allowed.
- **Session**: groups Files for a Car. Auto-bucketed by time-gap
  heuristic (default >4h = new session, configurable, user can
  re-bucket).
- **File**: one uploaded CSV blob.
- **CheckRun + CheckResult**: per-session, one verdict per check:
  Pass / Warn / Fail. No time-windowed violations in v1.

### Channels (hybrid library)
- Global canonical-channel library ships with the app
  (RPM, ThrottlePos, CoolantTemp, OilPressure, OilTemp, BatteryV,
  GroundSpeed, LatG, LongG, …)
- CarType can add team-local custom channels on top
- Custom channels carry a `source: 'global' | 'team'` discriminator

### Health-check tiers
1. **Simple** (v1): channel min/max thresholds — preset templates
2. **Conditional** (v1): min/max under a state (e.g. RPM > 4000 AND
   coolant < 95C) — preset templates + simple expression DSL
3. **Signal analysis** (v2+): patterns like cavitation detection from
   current/power channels
4. **Python user-blocks + AI-generated checks**: v2+

### Input format
- **v1: GEMS CSV exports only.** AiM (SoloDL / MXG), MoTeC, etc. drop
  in later by adding (CarType, DataSource) mappings — no engine
  changes needed.

### Output
- **Dashboard**: live web view per session and per car
- **Report**: exportable PDF / HTML summary per session

## Out of scope for v1

- Local file-watcher agent (auto-upload from user's machine) — v2
- Notifications (email / Slack to crew chief) — v2
- AI check generation — v2+
- Cross-session trend analytics beyond session list — v2+
- Real-time / live-telemetry ingestion — v2+

## Working agreement

- Drive `docs/prd.md` via Matt Pocock's `to-prd` skill before any code.
- Use `to-issues` to break the PRD into GitHub issues.
- Use `tdd` once the health-check engine starts.
- Use the data-analytics-skills (`programmatic-eda`,
  `data-quality-audit`, `time-series-analysis`,
  `root-cause-investigation`) when exploring real GEMS CSV samples.

## Top risks to de-risk early

1. **GEMS CSV format quirks**: multi-row headers, unit rows, locale
   decimals, per-channel sample rates. Get 3+ real files and write
   the parser as a local Python script *before* any infra wiring.
2. **Vercel Postgres + serverless connection exhaustion**: use the
   pooled connection string from day one.
3. **Clerk Org → row-level isolation**: pick `team_id` column +
   required-arg query helper (with a lint rule) before any tables go
   in. Retrofitting is painful.

## External skills used by this project

Neither of these is a Claude Code marketplace, so `/plugin marketplace
add` will fail on both. Use the install paths below.

### Matt Pocock's skills (`mattpocock/skills`)

Installed via Matt's own installer — interactive, asks which skills to
enable and which agents to install them on:

```bash
npx skills@latest add mattpocock/skills
```

When prompted, **make sure `/setup-matt-pocock-skills` is selected**.
After install, run `/setup-matt-pocock-skills` once in this repo to
generate `docs/agents/` (it asks about issue tracker, label scheme, and
docs path).

### Nimrod Fisher's data-analytics skills (`nimrodfisher/data-analytics-skills`)

Not packaged for installation — it's a reference library of skill
definitions organised by category. Two ways to use it:

1. **Just describe the task in plain language** — Claude will reach for
   the relevant skill (`programmatic-eda`, `data-quality-audit`,
   `time-series-analysis`, `root-cause-investigation`, etc.) when the
   request matches.
2. If you want them as first-class slash-commands, clone the repo and
   copy the specific skill folders you want into `.claude/skills/` in
   this repo (or `~/.claude/skills/` for user-wide).

## Agent skills

### Issue tracker

Issues live as markdown under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default kebab-case role strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Pointers for future sessions

- `/Users/billyjack/.claude/plans/grill-me-and-lets-iridescent-ritchie.md`
  — full planning doc, MVP build sequence, verification plan.
- `docs/agents/` — populated by `setup-matt-pocock-skills`.
- `docs/prd.md` — product requirements once authored.
- `racecarhealth/` — source modules once scaffolded.
