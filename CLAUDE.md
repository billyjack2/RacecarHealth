# RaceCarHealth — Claude Context

This project analyzes race-car CSV telemetry logs, runs automated health
checks against them, and surfaces results through a web dashboard and
reports. A small local agent watches a folder for newly downloaded logs
and uploads them into the system automatically.

## What's decided

- **Data source**: CSV files on disk. AiM exports (SoloDL, MXG) are the
  priority format; a generic CSV path is also required.
- **Delivery**: web dashboard plus a local auto-upload agent.
- **Module layout**: single repo, separate modules — `agent/`, `core/`,
  `web/`.
- **Health-check complexity tiers**:
  1. Simple — channel min/max thresholds.
  2. Conditional — min/max under a state (e.g. RPM > 4000 AND coolant <
     95C).
  3. Signal analysis — detecting patterns such as cavitation in an
     electric pump from current/power channel behavior.
- **User-definable checks**: the engine must let users define new checks
  on top of pre-built ones.

## What's not decided yet

- Web framework (FastAPI+HTMX vs Streamlit vs Flask+Dash vs Next.js).
  Wait for the PRD before choosing.
- Storage backend (sqlite, Postgres, flat files).
- Auth / multi-user model.
- Whether real-time / live-telemetry ingestion is in scope (likely v2).

## Working agreement

- All development happens on branch `claude/race-car-data-analysis-d9HFr`
  until the PRD is approved.
- Drive the PRD with Matt Pocock's `to-prd` skill before any code.
- Use `to-issues` to break the PRD into GitHub issues.
- Use `tdd` once the health-check engine starts.
- Use the data-analytics-skills (`programmatic-eda`, `data-quality-audit`,
  `time-series-analysis`, `root-cause-investigation`) when exploring
  real AiM CSV samples.

## Required skill marketplaces

Register these on first use in a clone of the repo:

```
/plugin marketplace add mattpocock/skills
/plugin marketplace add nimrodfisher/data-analytics-skills
```

Then run `/setup-matt-pocock-skills` to generate `docs/agents/`.

## Pointers for future sessions

- `docs/agents/` — populated by `setup-matt-pocock-skills`. Read these
  files before doing any planning or issue work.
- `docs/prd.md` — product requirements once authored.
- `racecarhealth/` — source modules once scaffolded.
