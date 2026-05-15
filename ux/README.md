# UX prototypes

Static HTML/JS prototypes for nailing the look-and-feel before scaffolding
the real app. Hard-coded fixtures; no build step; open any file directly
with `file://` in a browser.

## Live MVP pages

The locked direction (Variant D — dark, amber accent, Inter + JetBrains
Mono, hairline borders, no rounded corners). Each page links the shared
stylesheet and partials.

| Page | File | Purpose |
|------|------|---------|
| Fleet | `cars-list-d-final.html` | Cars table — primary home |
| Car detail | `car-detail.html` | One car's hero, setup, event history |
| Car-Event detail | `car-event-detail.html` | Per-(car, event) report — keystone leaf |
| Events | `events-list.html` | Events table (note: events deferred from MVP, page kept as future direction) |
| Event detail | `event-detail.html` | Cars-at-event with expandable stints (see above) |
| Team settings | `team-settings.html` | Identity + members + danger zone |
| Create team | `create-team.html` | Pre-app onboarding step 1 (no sidebar) |

## Conventions for new pages

Every live page uses the same shared chrome. To add a page:

1. **Link the shared stylesheet** in `<head>`:
   ```html
   <link rel="stylesheet" href="assets/app.css" />
   ```
2. **Drop in a sidebar slot** with the active nav key:
   ```html
   <aside id="sidebar" data-active="fleet"></aside>
   ```
   Valid `data-active` values: `fleet`, `events`, `sessions`, `reports`,
   `checks`, `channels`, `cartypes`, `settings`. Pre-app pages (no team
   yet) omit the sidebar slot entirely — see `create-team.html` for the
   topbar pattern.
3. **Include partials.js** after fixtures:
   ```html
   <script src="fixtures/data.js"></script>
   <script src="partials.js"></script>
   ```
4. **Use `RCH.toast(msg)`** for transient feedback. The toast element is
   auto-created — no need for `<div class="toast">` or local helpers.
5. **Page-specific CSS** (heroes, page-unique tables, custom strips)
   stays inline in a `<style>` block. The shared stylesheet provides the
   tokens (CSS vars, font stacks) and chrome (sidebar, page header,
   buttons, verdict pills, kebab/more menus, toolbar/chips/search,
   modals, toasts, trend dots, form fields, logo row).

## Shared assets

- `assets/app.css` — design tokens + chrome
- `assets/logo-crosslink.png` — sample team logo used by create-team and
  team-settings
- `partials.js` — auto-mounts the sidebar; exposes `RCH.toast`
- `fixtures/data.js` — `window.CROSSLINK` with team, cars, events, one
  fully-populated session
- `fixtures/logo.svg` — Crosslink wordmark (chain-link motif), used as
  the in-app brand mark inside the sidebar

## Historical / reference pages

Frozen prototypes from the design exploration. Not maintained but kept
for reference.

| Variant | Cars list | Session report |
|---------|-----------|----------------|
| A — Paddock (dark, dense, telemetry-coded) | `cars-list-a.html` | `session-report-a.html` |
| B — Clinical (light, calm, diagnostic) | `cars-list-b.html` | `session-report-b.html` |
| C — Modern SaaS (neutral, Linear/Vercel) | `cars-list-c.html` | `session-report-c.html` |
| D variants superseded by D-final | `cars-list-d.html`, `cars-list-d2.html`, `cars-list-d3.html` | — |
