# Session handoff — 2026-05-14

A snapshot of where the UX prototyping work is so the next session (on Mac)
can pick up cleanly.

## Branch

`claude/create-review-agents-FEfo4` — head `7963a4b` at time of writing.
All work is on this branch; nothing has been merged to `main` yet.

There are three other remote branches; only one matters going forward:

| Branch | State |
|--------|-------|
| `main` | last merge was the initial repo scaffold (PR #1) |
| `claude/race-car-data-analysis-d9HFr` | already merged via PR #1; safe to delete |
| `claude/lock-mvp-decisions` | one commit (MVP-stack lock); now redundant — fully contained in this branch |
| `claude/create-review-agents-FEfo4` | **active** — review subagents + all UX prototypes |

When you're ready to ship the groundwork, merge this branch to `main` (or
split into three smaller PRs: MVP-lock, review subagents, ux prototypes).

## What's locked

### Stack and domain
Already captured in `CLAUDE.md`. Note one **domain change** this session
that isn't in `CLAUDE.md` yet and needs to land in the PRD:

- **Events** sit between Car and Session: `Car → many Events → many Sessions per (car, event)`.
- Auto-bucketing rule: events bucket by track + date range; sessions still
  bucket by time-gap within an event.
- Reports roll up at two levels: per-session (existing) and per-(car, event)
  (new — this is now the primary "report" view).

### Other PM decisions ratified this session

- **Onboarding**: guided wizard (team → first car → first upload), one page
- **Archive**: soft, reversible, read-only. Hard delete is a separate action.
- **Audit log**: recorded in v1, no UI yet (table behind the scenes)
- **Rollup display**: worst-of plus per-file/per-stint breakdown inline
- **DSL scope**: minimal + time-window aggregates `max/mean/min(channel, Ns)`
  — flagged as real engine scope worth a parser/evaluator spike
- **Billing**: deferred for v1; tiered later. Free design-partner beta.
- **Retention**: indefinite while team is active
- **Active car definition**: created and not archived
- **Success metric**: ≥1 session/active car/week with the design partner; plus
  qualitative "saved the engine" stories

### Look-and-feel locked (Variant D)

After exploring A (Paddock dark), B (Clinical light/serif), and C (Modern SaaS
neutral), and three takes on D combining A's palette with C's sidebar:

- **Palette**: dark `#0a0b0d` bg, amber accent `#f59e0b`, vivid pass/warn/fail
- **Type**: Inter sans + JetBrains Mono for numerics
- **Chrome**: 232px left sidebar with uppercase nav, hairline borders, no rounded corners
- **Density**: tables, not cards (user explicitly rejected card-based variants)
- **Verdict treatment**: outlined mono pill with leading colored dot
- **Trend dots**: event-level (one dot = one event's rollup), clickable

## Where to look

### Canonical pages (the locked direction)

| File | What it is |
|------|------------|
| `ux/cars-list-d-final.html` | **Fleet** — primary home. Cars table with event-level trend, sortable, stub modals, footer ticker |
| `ux/events-list.html` | **Events** — table of all events with cars, stints, rollup, notable line. Sortable, filterable by kind/failure |
| `ux/event-detail.html` | **Event detail** — cars-at-event as expandable rows with per-stint sub-table |
| `ux/car-detail.html` | **Car detail** — one car's hero + lifetime stats + events table + setup card |
| `ux/car-event-detail.html` | **Car-Event detail** — the keystone "report" view. Hero combines car + event, 5-up stats, stints listed, worst-of check rollup with per-stint observed values |
| `ux/fixtures/data.js` | shared fixtures: Crosslink Motorsports team, 5 cars, 6 events, 1 fully-populated session |
| `ux/fixtures/logo.svg` | wordmark for `currentColor` theming |

### Historical variants (kept for reference; can be deleted once you're sure)

- `ux/cars-list-a.html`, `session-report-a.html` — Paddock direction
- `ux/cars-list-b.html`, `session-report-b.html` — Clinical direction
- `ux/cars-list-c.html`, `session-report-c.html` — Modern SaaS direction
- `ux/cars-list-d.html` — first D pass before events existed
- `ux/cars-list-d2.html` — D card grid (rejected)
- `ux/cars-list-d3.html` — D split events-on-top (rejected)

## Navigation graph as built

```
SIDEBAR
  Fleet     → cars-list-d-final.html
  Events    → events-list.html
  Sessions  → toast "coming next"
  Reports   → toast "coming next"
  Check library / Channel maps / Car types / Settings → toast

FLEET (cars table)
  ├─ row click → car-detail.html?id=<carId>
  └─ trend dot → car-event-detail.html?car=<carId>&event=<lastEvent.id>
                 (prototype shortcut: every dot resolves to lastEvent)

EVENTS LIST
  └─ row click → event-detail.html?id=<eventId>

EVENT DETAIL
  ├─ car-row click → expand/collapse inline stints
  ├─ stint row click → car-event-detail.html?car=<carId>&event=<eventId>
  └─ "Open car at event" link → car-event-detail.html?car=…&event=…

CAR DETAIL
  └─ event-row click → car-event-detail.html?car=<carId>&event=<eventId>

CAR-EVENT DETAIL (the keystone report; deepest leaf in v1)
  └─ stint card click → toast (no deeper view planned for v1)
```

## How to preview on Mac

### Option A — local (after `git pull`)

```sh
git fetch origin
git checkout claude/create-review-agents-FEfo4
git pull origin claude/create-review-agents-FEfo4

# Open any page directly — fixtures load via plain <script src>, no server needed
open ux/cars-list-d-final.html
```

### Option B — branch-tracking URLs (auto-updates after each push, caches per file)

- Fleet: https://raw.githack.com/billyjack2/RacecarHealth/claude/create-review-agents-FEfo4/ux/cars-list-d-final.html
- Events: https://raw.githack.com/billyjack2/RacecarHealth/claude/create-review-agents-FEfo4/ux/events-list.html
- Event detail: https://raw.githack.com/billyjack2/RacecarHealth/claude/create-review-agents-FEfo4/ux/event-detail.html
- Car detail: https://raw.githack.com/billyjack2/RacecarHealth/claude/create-review-agents-FEfo4/ux/car-detail.html?id=car_88
- Car-Event detail: https://raw.githack.com/billyjack2/RacecarHealth/claude/create-review-agents-FEfo4/ux/car-event-detail.html?car=car_88&event=evt_road_atl_may

### Option C — SHA-pinned URLs (always loads the matching data.js, no cache drift)

Replace `<SHA>` with the current branch tip (`git rev-parse HEAD`):

```
https://rawcdn.githack.com/billyjack2/RacecarHealth/<SHA>/ux/cars-list-d-final.html
```

Current SHA: **`7963a4b`**

## What's still pending

In rough priority order:

1. **UX-designer agent critique pass** on the full walk (Fleet → Car detail
   → Car-Event report; Events → Event detail → Car-Event report). Was the
   originally planned next step. Best run once the user has walked the flow.
2. **Update CLAUDE.md** to capture: Events domain concept, soft-archive
   semantics, audit-log decision, indefinite-retention decision, billing
   deferred, success metric, onboarding-wizard flow, look-and-feel locked.
3. **Architecture-reviewer pass** before any backend code. Key topics:
   - DSL parser + time-window evaluator (per-channel sample rate handling)
   - Modal → Next.js callback auth (HMAC vs signed URL)
   - Postgres row-level isolation pattern (lint vs RLS vs required-arg helper)
   - Inngest retry semantics for partial session failures
4. **PRD draft** via Matt Pocock's `to-prd` skill — once everything above
   is captured.
5. **Page inventory expansion** — pages not yet prototyped that the v1
   feature set implies:
   - First-run wizard (team → car → upload)
   - Upload dropzone / progress
   - Check library editor (DSL builder)
   - Channel mapping editor
   - Car type editor
   - Settings (team name, logo upload — locked but not built)
6. **Logo upload in Settings** — confirmed as a v1 requirement; used for
   report branding. Not yet built.
7. **Cleanup** — delete the historical A/B/C/D1/D2/D3 prototypes once the
   D-final direction is fully accepted, to reduce repo noise.
8. **Optional micro-fixes** noted by the user but not addressed:
   - "Details I'd change" in look-and-feel (user said this casually but
     didn't list them; ask when picking back up)

## Suggested next-session plan

1. Walk the flow yourself on the Mac (or have a teammate do it) to react
   in detail.
2. Decide whether to spawn the UX-designer agent now or after one more
   round of nits.
3. Update `CLAUDE.md` with the domain + decisions captured above so
   they don't drift.
4. Run the architecture-reviewer pass.
5. Then `to-prd`.

## Risks / things to remember

- **raw.githack caches per file** — when fixtures and HTML are pushed
  together, the data file can be stale for a few minutes. Pages have
  defensive fallbacks (derive event-shaped fields from session fields),
  so they render either way. If you see "no cars," it's almost certainly
  this — wait a few minutes or use the SHA-pinned `rawcdn` URL.
- The **trend-dot navigation** on Fleet currently resolves every dot to
  `lastEvent.id`. The real version needs to link each historical dot
  to its actual event id.
- **Drivers** was considered as a sibling nav item; explicitly dropped.
  If race teams later want driver-rollups (multi-car drivers), revisit.
- **Per-stint detail page**: not built. Car-Event detail is the deepest
  leaf in v1. Decision was that the rollup view shows enough.

## How to re-engage Claude on Mac

```sh
cd RacecarHealth
git checkout claude/create-review-agents-FEfo4
git pull origin claude/create-review-agents-FEfo4
claude
```

Then paste a one-liner like:

> Resuming UX work on RaceCarHealth. Read `docs/session-handoff-2026-05-14.md`
> first, then we'll continue from "what's still pending."
