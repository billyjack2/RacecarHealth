---
title: RaceCarHealth — Product Requirements (v1)
status: stub
owner: Billy Smith
lastUpdated: 2026-05-15
---

> This is a placeholder seeded from the locked decisions in `CLAUDE.md`.
> Fill it in with Matt Pocock's `to-prd` skill before any feature work
> begins.

## Problem

Race teams export GEMS CSV telemetry logs after each session. Today,
spotting health issues — overheating, low oil pressure, abnormal RPM
patterns — requires a human to open the file in a spreadsheet, scroll,
and remember what "normal" looks like for the car. This is slow,
error-prone, and doesn't scale across cars or sessions.

## Users

- **Crew chief** — uploads logs, reads the dashboard, exports reports.
- **Engineer** — configures CarTypes (channels, thresholds, layouts).
- **Driver / owner** — reads the report; does not author checks.

(v1 has a single role: team member with access to all team data. RBAC
is a v2 concern.)

## v1 scope

See `CLAUDE.md` for the full decision log. Headline:

- GEMS CSV uploads only
- Cars belong to CarTypes (template); sessions group files per car
- Health checks: simple (min/max) + conditional (state-gated)
- Output: live dashboard per session + exportable report

## Out of scope (v2+)

Local file-watcher agent, notifications, AI check generation,
cross-session trend analytics beyond the session list, real-time
ingestion.

## Open questions

(`to-prd` will populate these.)

- What does a "session" report look like exactly?
- Which check templates ship in the global library?
- How does the user discover that a check fired?
- What does the empty-state of a new team look like?

## Success metrics

(`to-prd` will populate.)
