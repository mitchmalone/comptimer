# CompTimer

Competition timing for sports events. A big dumb timer on the venue TV, driven entirely from the judge's phone.

- **Stack decisions and rationale:** [STACK.md](STACK.md)
- **Operating rules (humans and agents):** [AGENTS.md](AGENTS.md)
- **Current state of the build:** [docs/STATUS.md](docs/STATUS.md)

## What it is

Two surfaces, one session:

1. **Web display** (`app.comptimer.com`) — full-screen timer on a large monitor/TV, visible to the crowd. Shows a QR code on launch; once a phone pairs, it just renders whatever the session says.
2. **Mobile app** — held by the timekeeper/judge. Creates the session, pairs by scanning the QR, and owns every control: start, stop, skip, reset, adjust.

They stay in sync over Supabase Realtime by broadcasting **state transitions, not ticks** — each screen computes the countdown from its own clock, so the display keeps counting even if venue Wi-Fi drops.

First focus: climbing/bouldering formats (5 on / 5 off, etc.) plus fully custom timers. More sports later.

## Setup

```sh
pnpm install
```

Apps are not scaffolded yet — see [docs/ROADMAP.md](docs/ROADMAP.md).

## The daily loop

```sh
pnpm dev          # run apps locally
pnpm test         # all unit tests (Vitest)
pnpm typecheck    # tsc across the workspace
pnpm lint         # ESLint + Prettier check
```

## Map

| Path                  | What                                                         |
| --------------------- | ------------------------------------------------------------ |
| `apps/web`            | Crowd-facing display (React + Vite) — app.comptimer.com      |
| `apps/mobile`         | Judge's controller (Expo / React Native)                     |
| `apps/admin`          | Session/log inspection (React + Vite) — admin.comptimer.com  |
| `apps/api`            | Hono API on Vercel — pairing, webhooks, admin auth           |
| `packages/timer-core` | Pure timer state machine — no I/O, fully unit-tested         |
| `packages/contracts`  | Zod schemas + inferred types for every cross-surface payload |
| `docs/`               | Volatile state: STATUS, ROADMAP, JOURNAL, DECISIONS, plans   |

## License

Open source — license TBD before first public release.
