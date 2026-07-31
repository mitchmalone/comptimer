---
title: Phase 2 — Marketing site
status: done
created: 2026-07-31
updated: 2026-07-31
links:
  - ROADMAP.md#phase-2--marketing-site
  - design source: claude.ai/design/p/6035ec18… ("Comp Timer Marketing.dc.html")
---

# Phase 2 — Marketing site

## Goal

`www.comptimer.com` serves a real, responsive marketing site — the imported Claude
Design rebuilt as a static-export Next.js app — replacing the "Coming soon" placeholder.

## Context

Phases 1/3/4/5/6 are done; the product works end to end and ships via TestFlight. Phase 2
was the one surface blocked on `/design-login` (the design lives in a claude.ai design
project). Mitch exported the design bundle (`comptimerweb.zip`); `Comp Timer Marketing.dc.html`
is the source of truth for layout, copy, and palette.

`apps/marketing` is Next.js 16 with `output: 'export'` (static) and is already linked to the
`comptimer-marketing` Vercel project → www.comptimer.com. STACK.md §`apps/marketing`.

## Approach

Faithful translation, not a raw paste. The `.dc.html` is a self-contained `x-dc` design
component (React via `support.js`, `style-hover`/`{{ }}` idioms) — none of that runtime ships.
Rebuild as real Next.js:

- **Fonts** via `next/font/google` (self-hosted, no external request, no FOUC): Anton (display),
  Archivo (body), Chivo Mono (timer numerals).
- **Theme** as CSS custom properties on `:root` (dark default) + `:root[data-theme="light"]`,
  mirroring the design's DARK/LIGHT maps. A tiny inline pre-paint script in `<head>` reads
  `localStorage`/`prefers-color-scheme` to avoid a flash. A `ThemeToggle` client component
  flips `data-theme` and persists.
- **Sections** as components composed by `page.tsx` (server): marquee, header, hero + display
  mock, how-it-works (3 steps), feature pills, duo showcase (display + phone w/ skeuomorphic
  buttons), formats (5 cards), CTA band, footer.
- **Responsive**: the design is fixed-desktop px. Use `clamp()` for the big Anton headlines and
  stack the multi-column grids at mobile widths. Desktop tracks the mock closely.
- **Real domains/links**: design mock uses `.app` placeholders; use real infra — "Open a display"
  → `https://app.comptimer.com`. iOS/App-Store link + support email are placeholders pending real
  values (see open questions).

Styling: CSS Modules per concern + one `globals.css` for tokens, base, keyframes. Boring code.

## Steps

- [ ] `globals.css`: theme tokens (dark + light), base reset, marquee keyframes, responsive type helpers
- [ ] `layout.tsx`: next/font wiring, metadata (title/description/OG), pre-paint theme script
- [ ] `ThemeToggle` client component (persist to localStorage, toggle `data-theme`)
- [ ] Section components (marquee, header, hero, hero-mock, how, pills, duo, formats, cta, footer)
- [ ] `page.tsx` composes sections
- [ ] Responsive pass (mobile stacks, clamped headlines, nav collapse)
- [ ] `pnpm typecheck` + `pnpm lint` + `next build` green

## Acceptance criteria

- [ ] www.comptimer.com (preview deploy) renders the full page matching the design on desktop
- [ ] Light/dark toggle works and persists; no flash on load
- [ ] Responsive: usable and tidy on a phone width (no horizontal scroll, headlines don't clip)
- [ ] typecheck / lint / build all green; static export emits `out/`
- [ ] "Open a display" links to app.comptimer.com

## Out of scope

- App Store listing / real download link (app is TestFlight-only) — placeholder for now
- Real sponsor logos, blog, docs pages, analytics
- The "Comp Timer Mockups.dc.html" app-screen mockups (marketing only)

## Risks / open questions

- **Copy domains**: design says `comptimer.app` / `hello@comptimer.app`; real infra is `.com`.
  Using `.com`. Confirm the support email (`hello@comptimer.com`?).
- **iOS CTA target**: no App Store URL yet. Placeholder `#` until the listing exists.
- Fixed-px → responsive is judgement; desktop fidelity prioritised.
