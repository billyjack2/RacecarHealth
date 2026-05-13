# UX prototypes

Static HTML/JS prototypes for nailing the look-and-feel before scaffolding
the real app. Hard-coded fixtures; no build step; open any file directly
with `file://` in a browser.

## Round 1 — three visual directions, two pages each

Two pages were chosen because together they force every visual-language
decision (verdict colors, density tolerance, chrome, brand voice).

| Variant | Vibe | Cars list | Session report |
|---------|------|-----------|----------------|
| **A — Paddock** | Dark, dense, telemetry-coded | `cars-list-a.html` | `session-report-a.html` |
| **B — Clinical** | Light, calm, diagnostic | `cars-list-b.html` | `session-report-b.html` |
| **C — Modern SaaS** | Neutral, Linear/Vercel | `cars-list-c.html` | `session-report-c.html` |

All six pages render the same data from `fixtures/data.js` so the
comparison is apples-to-apples.

## Fixtures

- `fixtures/data.js` — `window.CROSSLINK` with team, cars, and one
  fully-populated session (3 files, 4 check groups, mixed verdicts)
- `fixtures/logo.svg` — Crosslink Motorsports wordmark (chain-link motif)

## After round 1

Pick a direction (or a mix). A UX-designer agent will critique the chosen
variant, then the rest of the page inventory gets produced one page at a
time with the same critique loop.
