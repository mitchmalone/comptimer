---
title: Web display — design-match to the hi-fi mockups
status: done
created: 2026-07-31
updated: 2026-07-31
links:
  - design source: Comp Timer Mockups.dc.html (W1 Pairing, W2 Live)
---

# Web display — design-match

## Goal

`app.comptimer.com` (the crowd-facing display) matches the hi-fi mockups: the
charcoal/cyan/amber palette, Archivo + Chivo Mono type, the W2 live layout
(status pill + 224px clock + boulder squares + sponsor strip) and the W1 pairing
layout (brand + "Scan to take control" + steps + white QR card + waiting bar).

## Context

Phases 3–5 built the display hand-rolled, before the design existed — full-screen
green/orange background themes, system fonts. The mockups (`Comp Timer Mockups.dc.html`)
are now the source of truth. This is a **pure restyle**: invariant 3 holds — no
session logic changes, timer-core / transport / sound / reconnect all untouched.

## Approach

Presentation only. Keep the `DisplayApp` data flow, `useSoundCues`, `useNow`,
transport, and the `TimerView` state→pixels contract. Swap the visuals:

- **Palette + type**: shared `theme.ts` constants (dark display tokens from the
  mockup); Archivo + Chivo Mono via a Google Fonts `<link>` in `index.html`.
- **TimerView (W2)**: constant charcoal background (no full-screen colour flip);
  phase communicated by a **state pill** (CLIMB cyan / REST + PAUSED amber /
  FINISHED). Header = organizer logo + session title (left) and a status cluster
  (right). Centre = pill + big Chivo Mono clock (final-5s red kept) + "BOULDER
  x OF y" with progress squares. Footer = "PRESENTED BY" sponsor strip when logos
  exist. Keep `footer`/`cornerControls` props so `DemoScreen` still works.
- **Status cluster**: sound (speaker icon + SOUND ON/OFF, still tap-to-enable) and
  connection (dot + LINKED / CONNECTING… / RECONNECTING…) moved into the header,
  replacing the corner SoundToggle + ConnectionDot for the real display.
- **PairScreen (W1)**: brand, "Scan to take control.", 3 numbered steps, white QR
  card (real QR kept) + code chip, "WAITING FOR CONTROLLER…" bottom bar.
- Display stays **dark-only** (a crowd screen); light theme deferred.

## Steps

- [ ] `index.html`: fonts + dark background (no white flash)
- [ ] `theme.ts`: display palette + font constants; small css for sponsor auto-scroll keyframe
- [ ] `TimerView.tsx`: W2 layout (pill / clock / squares / sponsor strip), keep props API
- [ ] `PairScreen.tsx`: W1 layout
- [ ] `DisplayApp.tsx`: header status cluster (sound + connection), subtle unpair, restyle Centered states
- [ ] typecheck / lint / build green; DemoScreen still renders

## Acceptance criteria

- [ ] Live display matches W2; pairing matches W1 (desktop / TV proportions)
- [ ] Final-5s red, reconnect indicator, sound tap-to-enable all still work
- [ ] `#demo` still drives locally with its control buttons
- [ ] typecheck / lint / build green

## Out of scope

- Light theme for the display; clickable-prototype states beyond live/pairing/waiting
- Mobile controller design-match (separate task)
- Any timer-core / transport / contracts change

## Risks / open questions

- Square count: cap so large plans (many boulders / Open Session) don't overflow —
  fall back to text-only when total is large.
- Fonts over the network at a venue: acceptable (they load before the session runs);
  revisit self-hosting if it bites.
