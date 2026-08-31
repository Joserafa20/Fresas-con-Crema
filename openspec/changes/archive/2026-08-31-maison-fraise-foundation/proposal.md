# Proposal: maison-fraise-foundation — FASE 1 Fundación (with FASE 0 Audit)

> Hybrid artifact — also persisted as Engram `sdd/maison-fraise-foundation/proposal`. Pace: auto.

---

## PART A — FASE 0 AUDIT REPORT (2026-08-31)

### 1. Repo State
- **Status**: `git init` only, branch `master`, **zero commits**, untracked: `.gitignore`, `openspec/`. Remote `origin https://github.com/Joserafa20/Fresas-con-Crema.git` empty (verified). No code, no dependencies, no lockfile.
- **Verdict**: Greenfield. No legacy debt, no migration. Risk is opposite: no foundation to build on.

### 2. Stack Detected
- **Declared**: none (empty repo). **Recommended** (sdd-init, validated): Next.js 14+ TS + NestJS TS + PostgreSQL/Prisma + pnpm workspaces. No conflict.
- **Runtime check**: `node`/`pnpm` not verified in this phase; assumed available on dev machine — to be validated in FASE 1 setup.

### 3. Architecture
- **Current**: none. **Planned**: pnpm monorepo `apps/web`, `apps/api`, `packages/shared` + Hexagonal boundaries + Atomic Design (web) + container/presentational. Sound for domain (orders/inventory/delivery need isolated domain core).

### 4. Dependencies
- **Current**: zero. **Proposed free-tier**: Neon/Supabase Postgres, Vercel (web), Render/Railway/Fly (api), Cloudinary/Supabase Storage, JWT+bcrypt. All zero-cost compliant. Supply-chain risk low; lock versions via pnpm.

### 5. Docs
- **Exist**: `openspec/project.md`, `openspec/config.yaml`, `.atl/testing-capabilities.md`, `.atl/skill-registry.md` — all consistent, cost/PWA/locale rules present.
- **Missing (needed)**: `README.md`, `CONTRIBUTING.md`, `openspec/specs/*` (none yet — expected), ADRs, env docs, PWA offline spec, API contract draft.

### 6. Git
- **Branch**: `master` (no commits). Remote fetch/push ok. No hooks, no CI, no branch protection. `.gitignore` only ignores `.atl/` — must extend for `node_modules`, `dist`, `.next`, `.env`.

### 7. Tests & Quality
- **All unavailable**: Vitest, ESLint, tsc, Prettier — proposed only. `strict_tdd=false` correct until runner lands. Coverage threshold 70 defined but unenforceable yet.

### 8. Problems — Critical
- No scaffold → every subsequent phase blocked. No env handling → secrets risk. No lint/typecheck → drift from day 1.

### 9. Tech Debt
- Zero inherited debt. **Anticipated debt if foundation delayed**: ad-hoc folder structure, duplicated DTOs, hardcoded config, no PWA baseline.

### 10. Gentle-AI / SDD Status
- `artifact_store: hybrid`, skills delegate-only OK, `.atl/` present, sdd-init memory #28 persisted. No `openspec/changes/*` active changes before this one. Toolchain healthy.

### 11. Docs Needed Before Build
- P1: `README.md`, `.env.example`, Prisma schema doc, PWA strategy, RBAC matrix. P2: ADRs, deployment runbook, domain glossary (orders/inventory/delivery).

### 12. SDD Structure Readiness
- `openspec/{project.md,config.yaml,specs/,changes/}` present. `changes/archive/` exists. Ready to receive `maison-fraise-foundation`.

### 13. Phases & First Task
- **Phases**: FASE 0 Audit (this) → FASE 1 Fundación (this proposal) → FASE 2 Domain (catalog/orders) → FASE 3 Inventory/Delivery → PWA polish → Deploy.
- **First task after approval**: Scaffold monorepo + `pnpm install` + `docker-compose.yml` (Postgres) + Prisma init — slice 1 of chained PRs, <400 lines.

---

## PART B — PROPOSAL: maison-fraise-foundation

## Intent
No runnable codebase exists. Without a typed monorepo, DB, and auth baseline, every feature (orders, perishable inventory, COP payments, Sabanalarga delivery) will be built on sand. This change creates the minimal shippable foundation so domain work can start with tests, types, and deploys green.

## Scope

### In Scope
- pnpm workspaces + `turbo.json` (optional) + root `package.json`/`tsconfig.json`
- `apps/web`: Next.js 14+ TS PWA shell (App Router, `es-CO`, placeholder home, PWA manifest)
- `apps/api`: NestJS TS skeleton (health endpoint, global ValidationPipe, CORS)
- `packages/shared`: DTOs/constants/zod schemas (single source of truth)
- `docker-compose.yml` Postgres 16 + Prisma init (`schema.prisma`, migrate setup)
- Env handling: `.env.example`, `apps/*/ .env.example`, validation (zod) — no secrets committed
- Auth/RBAC scaffolding plan (JWT access+refresh, bcrypt, roles `admin|seller|delivery` — plan only, no full impl)
- Quality: ESLint + Prettier + `tsc --noEmit` + Vitest placeholder (`pnpm test`/`pnpm build` pass)
- CI: GitHub Actions `ci.yml` (install, lint, typecheck, test, build) — free tier
- Docs: `README.md`, updated `.gitignore`, `openspec` structure

### Out of Scope
- Domain features (catalog, orders, inventory, payments, delivery) — FASE 2+
- Full auth implementation, image storage integration, offline queue sync, E2E (Playwright)
- Production deploy / infra provisioning

## Capabilities

### New Capabilities
- `monorepo-workspace`: pnpm workspaces, Turborepo, shared tsconfig
- `web-shell`: Next.js PWA shell, i18n es-CO, manifest, offline-ready baseline
- `api-skeleton`: NestJS app, health check, validation, config
- `shared-kernel`: Shared DTOs/types/zod across web/api
- `persistence-foundation`: Docker Postgres + Prisma schema + migrations
- `quality-gates`: ESLint, Prettier, tsc, Vitest, CI

### Modified Capabilities
- None — greenfield, no existing specs to modify.

## Approach
Hexagonal: `packages/shared` is kernel, domain stays pure. Slice foundation into stacked PRs (<400 lines each) targeting `master` sequentially: (1) workspaces+tooling, (2) web shell, (3) api skeleton, (4) DB/Prisma, (5) quality+CI. Validate each slice with `pnpm build` + `pnpm test`. Cost: all free-tier; PWA uses `next-pwa`/Workbox later — shell only now.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `pnpm-workspace.yaml`, `package.json`, `turbo.json`, `tsconfig.json` | New | Monorepo root |
| `apps/web/**` | New | Next.js PWA shell |
| `apps/api/**` | New | NestJS skeleton |
| `packages/shared/**` | New | Shared kernel |
| `docker-compose.yml`, `prisma/**` | New | Postgres + Prisma |
| `.github/workflows/ci.yml` | New | CI |
| `.gitignore`, `.env.example`, `README.md` | Modified/New | Docs & hygiene |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Over-scaffolding delays domain value | Med | Minimal shell only; domain in next change |
| pnpm/Turbo version drift | Low | Pin versions, `engines` field |
| Prisma/Postgres local friction | Med | `docker-compose` + documented `pnpm db:*` scripts |
| Auth plan misalignment | Low | Spec RBAC matrix before impl; JWT+bcrypt only (no paid SaaS) |
| Cost creep | Low | CI uses free-tier only; no paid services |

## Rollback Plan
Foundation is additive. Revert PRs in reverse order (`git revert`). No data loss (no prod DB). If Prisma migration ran locally, `prisma migrate reset`. CI failure → fix forward, no deploy gate yet.

## Dependencies
- Node 20+, pnpm 9+, Docker (for Postgres). No external service required to merge.

## Success Criteria
- [ ] `pnpm install` + `pnpm build` + `pnpm test` pass from clean clone
- [ ] `docker-compose up -d` starts Postgres; `prisma migrate` succeeds
- [ ] `apps/web` serves placeholder home (es-CO) and `apps/api` returns `GET /health → 200`
- [ ] ESLint + `tsc --noEmit` + Prettier pass; CI green on `master`
- [ ] No secrets in repo; `.env.example` present

## Cost & PWA Note
Zero-cost constraint respected (Vercel/Render/Neon free tiers, no paid auth/storage). PWA: manifest + installable shell now; offline queue deferred to domain phase — approach keeps bundle small.

## Proposal Question Round (pace=auto — assumptions inline)

Assumptions (proceed, correct in spec/design if needed):
1. **Roles**: `admin` (all), `seller` (orders/catalog), `delivery` (delivery status only) — 3 roles.
2. **Payments**: COP cash/transfer recorded manually first; no gateway in FASE 1-2.
3. **Inventory**: Perishable (strawberries) — expiry tracking is FASE 3, not foundation.
4. **Delivery**: Sabanalarga urban only, no third-party logistics yet.
5. **PWA offline**: Catalog browse offline; order placement queues and syncs — spec in FASE 2.

Questions for review (answer async, no blocker):
1. Are the 3 roles sufficient or is `customer` (self-service ordering) needed sooner?
2. Payment: keep manual COP recording for FASE 2 or prioritize gateway (e.g., Wompi/MercadoPago)?
3. Perishable inventory: need lot/expiry from day 1 or can defer to FASE 3?
4. Delivery: home delivery only or also pickup point?
5. PWA: must orders be submittable fully offline in FASE 2, or is "queue + sync" acceptable post-MVP?
