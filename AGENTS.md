# AGENTS.md — CompTimer

CompTimer is a competition timer for climbing gyms: a judge's phone drives a crowd-facing display on any venue screen. No logins, no installs at the venue — reliability is the product.

## Standard

This project is built on the [jig](https://github.com/mitchmalone/jig) and follows its `AGENTS.md` standard. This file carries **deltas only** — identity, stack, invariants — never restatements. Divergences from the standard live in `DEVIATIONS.md` with a justification.

## Docs system

Living state is in `docs/` — see the standard for roles and discipline. Session protocol: orient on `docs/STATUS.md` and `docs/plans/active/` → plan before non-trivial work → record decisions/gotchas as they happen → close out docs in the same commit as the code.

## Stack

| Surface                          | Choice                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| `apps/web` — app.comptimer.com   | Vite + React SPA. The crowd display: renders state, counts locally, dark-only        |
| `apps/mobile` — judge controller | Expo React Native; EAS Build/Submit → TestFlight (see `DEVIATIONS.md`)               |
| `apps/api` — api.comptimer.com   | Hono on Vercel. Pairing, admin auth, later webhooks; only holder of service-role key |
| `apps/admin` — admin.comptimer   | Vite + React SPA, password-gated through `apps/api`                                  |
| `apps/marketing` — www           | Next.js, static                                                                      |
| `packages/contracts`             | Zod schemas + inferred types — every cross-surface payload                           |
| `packages/timer-core`            | Pure TS timer state machine, zero dependencies                                       |
| `packages/transport`             | `SessionTransport` interface + Supabase Realtime implementation                      |
| Data / realtime                  | Supabase Postgres + Realtime (provisioned via Vercel Marketplace)                    |
| Deploy                           | Vercel, four projects (a recorded deviation — see `DEVIATIONS.md`)                   |

Local ports: `apps/api` dev server on **8787**; `apps/web` / `apps/admin` on Vite defaults (5173+).

## Invariants

1. **`packages/timer-core` is pure.** No I/O, no network, no direct `Date.now()` — time is injected. Every behaviour is unit-tested. If you're tempted to import anything with a side effect, you're in the wrong package.
2. **Sync state transitions, never ticks.** The network carries commands and session state (`startedAt`, phase plan, pause offsets). Each surface renders the countdown from its own clock. Nothing that runs every second may touch the network.
3. **The phone is the authority; the display is a renderer.** All commands originate from mobile. `apps/web` holds no session logic beyond rendering state and counting locally.
4. **Every cross-surface payload is a Zod schema in `packages/contracts`.** Types are inferred, never hand-written twice. No unvalidated message crosses a process boundary.
5. **Transitions carry server timestamps.** Clients estimate their clock offset once and render against corrected time. Never trust a device clock raw.
6. **The display must survive disconnection.** On transport loss: keep counting locally, show a subtle connection indicator, rehydrate from the sessions row on reconnect.
7. **Transport is an implementation detail.** All realtime access goes through the `SessionTransport` interface — no direct `supabase-js` channel calls in feature code.
8. **Auth, payments, and new presets are sequenced in `docs/ROADMAP.md`** — check it before adding any of them.

## Commands

| Command                  | What                                                            |
| ------------------------ | --------------------------------------------------------------- |
| `pnpm dev`               | Run web + api in parallel                                       |
| `pnpm verify`            | The gate: typecheck + lint + format check + test                |
| `pnpm build:ios:mobile`  | EAS production build (add `-- --auto-submit --non-interactive`) |
| `pnpm submit:ios:mobile` | EAS submit latest build to TestFlight                           |

## Definition of done

- `pnpm verify` green.
- New behavior has tests, written first (red/green/refactor) — non-negotiable for `packages/*`.
- No invariant above violated.
- `docs/STATUS.md` updated and the plan moved to `done/` in the same commit.
