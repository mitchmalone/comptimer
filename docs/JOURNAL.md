# JOURNAL

> Append-only build log. **Newest at the top.** Each entry: date, title, then bullets whose lead is a bolded takeaway.

### 2026-07-30 — Roadmap reordered; Phase 1 plan written

- **Phases resequenced for visible progress:** marketing site moves ahead of product bones so something real is live early; web bones (with `timer-core`) precede mobile bones; communication lands with the mobile phase; polish phases follow per surface.
- **Phase 1 plan is agent-ready** (`docs/plans/active/phase-1-scaffolding.md`): full step list, acceptance criteria, and known risks (Expo-in-pnpm-workspace quirks, DNS verification).
- **CLI tooling confirmed available:** `vercel` (project linking, domains, deploys), `supabase` (Phase 4 provisioning), `cloudflared` (later, tunneling a local display for phone testing).

### 2026-07-30 — Project inception & docs scaffolding

- **Architecture settled before any code: sync state transitions, never ticks.** The network carries server-stamped commands and session state; each surface renders the countdown from its own (offset-corrected) clock. This makes the display resilient to venue Wi-Fi loss — the defining reliability property.
- **Supabase Realtime chosen as transport, Expo for mobile.** Both confirmed with Mitch; rationale in DECISIONS.md and STACK.md §2.
- **Repo conventions ported from psyke:** pnpm workspaces, Vitest colocated tests, ESLint 9 + Prettier, lefthook, Conventional Commits, rules/rationale split (AGENTS.md / STACK.md), volatile docs/ tree with plan lifecycle.
- **Known tension flagged, not solved: no-login + subscriptions.** Plan is anonymous device ID + RevenueCat when Phase 4 arrives; Apple's IAP cut pressures the $2.99/$9.99 price points.
