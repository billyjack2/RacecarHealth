# Session handoff — 2026-05-14 (PM)

Picks up from `session-handoff-2026-05-14.md` (the morning Mac-side
resume doc). Read both if you're starting cold; this doc only covers
what shipped after the resume.

## Branch

`claude/create-review-agents-FEfo4` — still no merges to `main`. Read
`git log --oneline` for the latest tip; new work since the resume sits
on top of `7a59018`.

## What's locked since the last handoff

### Domain / scope changes
- **Events deferred from MVP.** The Events domain concept (Car → Event →
  Session) is now post-v1 advanced. v1 is **cars + sessions + files only**.
  Event-related pages stay in the repo as future-direction reference but
  are no longer in the sidebar. This is captured in user memory
  `mvp-scope-events-deferred` (authoritative; CLAUDE.md hasn't been
  rewritten yet to drop event references — do that as part of the next
  PRD pass).
- **External skills install paths corrected** in CLAUDE.md. Neither
  `mattpocock/skills` nor `nimrodfisher/data-analytics-skills` is a
  Claude Code marketplace — the original `/plugin marketplace add`
  instructions don't work. Matt's installer is `npx skills@latest add
  mattpocock/skills`; Nimrod's is "no install, just describe the task,"
  or copy specific skills folders into `.claude/skills/`.

### Look-and-feel changes
- **Cyan accent (`#22d3ee`) replaces amber as the brand color.** Amber
  (`#f59e0b`) is now exclusive to the warn verdict — they were the same
  hue before, which cost visual signal. One swap in `ux/assets/app.css`
  (`--accent` + `--accent-dim`) and the body radial-glow.
- **Read-only-by-default for editable settings.** Identity-style cards
  show a compact prop grid by default. Click `Edit` to swap the inputs
  in; `Cancel` / `Esc` exits without saving; `Save` writes through and
  collapses back. Currently applied to **car-type-detail only**;
  team-settings still uses always-open inputs and is queued for the same
  treatment.
- **Build-one-page-then-critique cadence** — saved as user memory
  `ux-iteration-cadence`. Don't batch multiple pages without feedback
  in between.

### Architectural / code changes
- **Shared chrome extracted.** `ux/assets/app.css` owns design tokens +
  sidebar + nav + footer + buttons + verdict pill + kebab/more menus +
  toolbar/chips/search + table base + form fields + logo row + modal +
  toast + trend dots. `ux/partials.js` auto-mounts the sidebar from
  `<aside id="sidebar" data-active="X"></aside>` and exposes
  `RCH.toast(msg)`. Stub nav items toast "coming next" automatically —
  no per-page wiring. Conventions for adding new pages are in
  `ux/README.md`.
- **Car type templates** moved into `fixtures/data.js` as
  `carTypeTemplates` so the list and detail pages share one source of
  truth (4 types: Spec Miata, Radical SR3, LMP3, GT4 Cayman, with
  channel mappings + checks).

## Page inventory — current state

### Live MVP pages

| File | Purpose | Notes |
|------|---------|-------|
| `ux/cars-list-d-final.html` | **Fleet** — primary home, cars table | Trimmed to 2 stat tiles; trend-dot column still links via `lastEvent` (see risks) |
| `ux/car-detail.html` | One car: hero + setup + event history | Sortable+searchable history table; Archive in More overflow menu |
| `ux/create-team.html` | Pre-app onboarding step 1 | No sidebar, topbar instead. Logo upload prototype-loads `assets/logo-crosslink.png` |
| `ux/team-settings.html` | Identity + members + danger zone | **TODO**: backfill the read-only-by-default Identity pattern from car-type-detail |
| `ux/car-types.html` | Sortable+searchable list of car types | Click row → detail |
| `ux/car-type-detail.html` | Type editor | Identity = read-mode default + Edit toggle. Channels + Checks tables (toggles, kebabs). Cars-of-this-type chips. Danger zone with delete-blocked-when-cars-inherit. |

### Deferred (post-v1) — kept as reference

| File | Notes |
|------|-------|
| `ux/events-list.html` | No sidebar nav entry; reachable only by direct URL or via car-event-detail breadcrumb |
| `ux/event-detail.html` | Reachable from events-list |
| `ux/car-event-detail.html` | Still linked from Fleet trend dots and Car detail's event history. When de-event-ifying, those links retarget to a per-session report instead. |

### Frozen / historical (do not touch)

`cars-list-a/b/c/d/d2/d3.html`, `session-report-a/b/c.html` — past
exploration variants. README documents them as reference.

## Navigation graph as built

```
SIDEBAR
  Primary:    Fleet → cars-list-d-final
              Sessions → toast (coming next)
              Reports  → toast (coming next)
  Configure:  Check library → toast
              Channel maps  → toast
              Car types     → car-types
              Settings      → team-settings

FLEET (cars table)
  ├─ row click → car-detail?id=…
  └─ trend dot → car-event-detail?car=…&event=lastEvent.id  (orphan; see risks)

CAR DETAIL
  └─ event-row click → car-event-detail (same orphan caveat)

CAR-TYPES (list)
  └─ row click → car-type-detail?id=…

CAR-TYPE-DETAIL
  ├─ Identity Edit → swap to inputs → Save commits, Cancel/Esc reverts
  ├─ Channel kebab: Edit mapping / Rename CSV column / Remove (toasts)
  ├─ Check kebab:   Edit expression / Duplicate / Remove (toasts)
  ├─ Check toggle:  works (live-flips enabled state, updates hero count)
  └─ Cars-of-type chip → car-detail?id=…

TEAM-SETTINGS
  ├─ Identity Save / Discard (always-open inputs — backfill needed)
  ├─ Member kebab: Set as Admin / Member / Remove / Resend invite / Cancel
  └─ Danger zone: Archive team / Delete team (toasts)

CREATE-TEAM (pre-app)
  ├─ "Create team" → toast → fleet
  └─ "Skip"        → toast → fleet
```

## How to preview on Mac

Same as before — open any page directly with `file://`:

```sh
open ux/cars-list-d-final.html
open ux/car-types.html
open ux/car-type-detail.html?id=spec_miata
open ux/team-settings.html
open ux/create-team.html
```

(URL params on the detail pages: `car-type-detail.html?id=spec_miata |
radical_sr3 | lmp3 | gt4_cayman`. `car-detail.html?id=car_43 | car_88 |
car_7 | car_21 | car_99`.)

## What's still pending (priority order)

1. **Walk the new pages on the Mac** to react in detail — especially
   the cyan accent across all live pages and the read-mode Identity
   card on car-type-detail.
2. **Restart the Claude Code session** to pick up the 18 newly-installed
   Matt Pocock skills at `~/.claude/skills/`. They were copied manually
   (npm wasn't available) so they won't appear in `Skill` results until
   a fresh session loads them.
3. **Backfill read-mode-by-default Identity card to `team-settings.html`**
   — same pattern as `car-type-detail.html`. This is the smallest
   pending item and a fast win.
4. **Update CLAUDE.md** to drop Events from the locked domain section
   and capture the cyan/look-and-feel decisions. The existing handoff
   recommended this; still pending.
5. Continue the remaining tasks in order:
   - **Car creation page** (replaces Add-car modal stub on Fleet)
   - **Upload dropzone + parse/bucket progress page**
   - **Check library + DSL builder**
   - First-run wizard (wraps Create team → Create car → Upload as a
     guided sequence — design after the standalone pages exist)
6. **Run the architecture-reviewer pass** before any backend code
   (carry-over from the previous handoff; topics unchanged: DSL
   evaluator, Modal callback auth, Postgres isolation, Inngest retry).
7. **PRD draft** via Matt's `to-prd` skill (now installed) once the
   above lands.

## Risks / things to remember

- **Trend-dot navigation still resolves to `lastEvent.id`.** Carry-over
  from the previous handoff. Each historical dot in Fleet's event-trend
  column needs its own event id; right now they all link to the same
  car-event-detail. When events get de-MVP'd properly, this collapses
  to a per-session link instead.
- **Per-stint detail page is not built.** The keystone leaf in v1 is
  car-event-detail (or, post-events-removal, a per-session report).
- **CLAUDE.md still references Events** in the domain model section.
  Memory `mvp-scope-events-deferred` is the authoritative truth until
  CLAUDE.md is rebaselined.
- **`raw.githack` caches per file.** If using it instead of local
  `open`, expect a few minutes of staleness when fixtures and HTML
  change together. Defensive fallbacks in the pages still render.
- **18 Matt Pocock skills installed at `~/.claude/skills/`** but won't
  surface in this session — restart required. Categories: 10 engineering,
  4 productivity, 4 misc. Skipped Matt's `deprecated/`, `in-progress/`,
  and `personal/` folders.

## Memory worth recalling

- `mvp-scope-events-deferred` — Events are post-v1
- `ux-iteration-cadence` — one page at a time, then critique
- `feedback_platform_preferences` — managed-over-raw, no AWS, willing
  to pay for automation

## How to re-engage Claude on Mac

```sh
cd RacecarHealth
git fetch origin && git checkout claude/create-review-agents-FEfo4 && git pull
# Quit any open Claude Code session first so the new ~/.claude/skills/ load
claude
```

Then a one-liner like:

> Resuming UX work on RaceCarHealth. Read `docs/session-handoff-2026-05-14-pm.md`
> first (and the morning handoff it references), then continue from
> "What's still pending."
