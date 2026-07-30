---
title: Phase 1 — Scaffolding
status: active
created: 2026-07-30
updated: 2026-07-30
links: [docs/ROADMAP.md, STACK.md]
---

# Task

## Goal

A pnpm monorepo where every app builds, tests, lints, and deploys as a placeholder: www / app / admin domains live on Vercel, the Expo app boots, CI is green, and both packages prove the test pipeline.

## Context

Greenfield. All conventions are already law — read `AGENTS.md` and `STACK.md` §2 before starting. Tooling choices are ported from the psyke repo (pnpm workspaces, no Turbo; Vitest colocated; ESLint 9 flat + Prettier 3; lefthook + commitlint). The `vercel` CLI is available and authenticated — use it for project linking and domains. Supabase provisioning is **Phase 4**, not here.

## Approach

Bottom-up: workspace + shared tooling first, then packages (with one real test each), then apps, then deploy + CI. Keep every placeholder app as close to its generator's output as possible — polish is later phases' job.

## Steps

- [ ] Root: `package.json` (`private`, `"type": "module"`, `engines.node >= 22`, `packageManager: pnpm`), `pnpm-workspace.yaml` (`apps/*`, `packages/*`), `.gitignore`, `.nvmrc`
- [ ] `tsconfig.base.json`: strict, `noUncheckedIndexedAccess`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`, `isolatedModules`, `moduleResolution: "bundler"`, `noEmit`, target ES2022; every package extends it
- [ ] Prettier 3 (no semis, single quotes, width 80) + ESLint 9 flat config with typescript-eslint; root scripts `lint`, `format`
- [ ] lefthook: pre-commit (eslint --fix + prettier --write on staged, `stage_fixed`), commit-msg (commitlint, conventional config), pre-push (typecheck + test); `prepare` script installs it
- [ ] `packages/contracts`: Zod dep, `exports` raw TS (`"./src/index.ts"`), placeholder `DisplayCode` schema + one Vitest test
- [ ] `packages/timer-core`: zero deps, placeholder `createTimer` returning an idle state + one Vitest test (real state machine is Phase 3)
- [ ] `apps/web`: Vite + `@vitejs/plugin-react-swc`, "CompTimer" placeholder page
- [ ] `apps/admin`: same Vite setup, placeholder page
- [ ] `apps/api`: Hono + `@hono/node-server` dev entry, `GET /health` returning `{ ok: true }`, Vercel entry per Hono-on-Vercel docs, one test
- [ ] `apps/marketing`: `create-next-app` placeholder ("CompTimer — coming soon"); built out in Phase 2
- [ ] `apps/mobile`: `create-expo-app` (TypeScript template), renders "CompTimer" — verify it typechecks in the workspace; note any pnpm/Metro workspace config needed
- [ ] Root scripts: `dev`, `test` (`pnpm -r test`), `typecheck`, `lint`, `build` as thin `pnpm -r` / `--filter` wrappers
- [ ] CI: `.github/workflows/ci.yml` — pnpm + node 22 with cache, `install --frozen-lockfile`, typecheck, lint, test, build; runs on PRs and pushes to main
- [ ] Vercel: create + link projects for web, admin, api, marketing via `vercel` CLI; assign domains app./admin./www.comptimer.com; deploy placeholders

## Acceptance criteria

- [ ] `pnpm install && pnpm typecheck && pnpm lint && pnpm test && pnpm build` all green from a clean clone
- [ ] CI green on a PR
- [ ] www, app, and admin .comptimer.com each serve their placeholder over HTTPS
- [ ] `apps/api` `/health` responds in production
- [ ] Expo app boots in Expo Go from `pnpm --filter mobile dev`
- [ ] Commit rejected by hooks when message isn't conventional or lint fails

## Out of scope

Supabase (Phase 4), timer state machine (Phase 3), any real UI, auth, payments, cloudflared tunnels (used later for phone↔local-display testing).

## Risks / open questions

- Expo inside a pnpm workspace sometimes needs `node-linker` tweaks or Metro `watchFolders` config — resolve and document in JOURNAL whatever is required.
- `comptimer.com` DNS must already point at Vercel for domain assignment to succeed; if `vercel domains` shows it unverified, flag to Mitch rather than churning.
