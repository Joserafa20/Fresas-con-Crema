# Tasks: maison-fraise-foundation — FASE 1 Fundacion

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~900-1100 (excl. lockfile) |
| 400-line budget risk | High (monolithic) / Low per slice |
| Chained PRs recommended | Yes |
| Suggested split | 5 stacked PRs to master |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Monorepo workspaces + root tooling | PR1 `chore/foundation-workspace` -> master | `pnpm install && pnpm -r build && pnpm typecheck` | N/A (verify clean clone install) | `pnpm-workspace.yaml`, `package.json`, `tsconfig.base.json`, `turbo.json`, `.nvmrc`, `.gitignore`, `README.md` |
| 2 | Web shell + shared kernel | PR2 `feat/web-shell` -> master | `pnpm --filter web build && pnpm --filter shared test` | `pnpm --filter web dev` GET `/` 200 lang=es, `/manifest.webmanifest` 200 | `apps/web/**`, `packages/shared/**` |
| 3 | API skeleton (NestJS+health) | PR3 `feat/api-skeleton` -> master | `pnpm --filter api test && pnpm --filter api build` | `pnpm --filter api start` curl `/api/v1/health` 200 | `apps/api/**` |
| 4 | Persistence (compose+Prisma) | PR4 `feat/persistence-foundation` -> master | `docker compose config && pnpm prisma generate` | `docker compose up -d && pnpm prisma migrate dev` | `docker-compose.yml`, `prisma/**`, `.env.example` |
| 5 | Quality gates + CI | PR5 `chore/quality-gates-ci` -> master | `pnpm lint && pnpm typecheck && pnpm test && pnpm build` | Push to CI; Husky blocks bad commit | `eslint.config.*`, `.prettierrc*`, `vitest.*`, `.github/workflows/ci.yml` |

## Phase 1: Monorepo Workspaces + Root Tooling

- [x] 1.1 Create `pnpm-workspace.yaml` `["apps/*","packages/*"]` | `pnpm-workspace.yaml` | monorepo-workspace#Layout | 0.5h | -
- [x] 1.2 Create root `package.json` pnpm@9 engines node>=20 scripts build/test/lint/typecheck/db:{up,down} | `package.json` | monorepo-workspace#Layout | 0.5h | 1.1
- [x] 1.3 Create `tsconfig.base.json` strict ESNext bundler path `@maison-fraise/shared` + extends | `tsconfig.base.json` | monorepo-workspace#TS | 0.5h | 1.1
- [x] 1.4 Create `turbo.json` pipeline build^build test/lint/typecheck cached | `turbo.json` | monorepo-workspace#TS | 0.5h | 1.2
- [x] 1.5 Update `.gitignore` + `.nvmrc` 20 + `README.md` setup/free-tier | `.gitignore`,`.nvmrc`,`README.md` | monorepo-workspace SC | 0.5h | 1.2
- [x] 1.6 Verify `pnpm install` clean clone + `pnpm typecheck` propagates shared error | — | monorepo-workspace Scenarios | 0.25h | 1.1-1.5

## Phase 2: Web Shell + Shared Kernel

- [x] 2.1 Create `packages/shared` `@maison-fraise/shared` exports schemas/constants Zod | `packages/shared/**` | shared-kernel#Exports | 1h | Ph1
- [x] 2.2 Implement `health.ts` `pagination.ts` `roles.ts` `locale.ts` (es-CO/COP) z.infer | `packages/shared/src/**` | shared-kernel#Zod+web constants | 1h | 2.1
- [x] 2.3 Scaffold `apps/web` Next.js 14 App Router `layout.tsx` lang=es `page.tsx` `manifest.ts` | `apps/web/**` | web-shell#Shell | 2h | 2.1
- [x] 2.4 Add PWA manifest standalone MAISON FRAISE + icons | `apps/web/app/manifest.ts`,`public/icons/**` | web-shell#PWA | 1h | 2.3
- [x] 2.5 Verify `web build` 200 lang=es + manifest 200 + Zod safeParse fail | — | web-shell+shared-kernel Scenarios | 0.5h | 2.2-2.4

## Phase 3: API Skeleton

- [x] 3.1 Scaffold `apps/api` NestJS `main.ts` prefix /api/v1 CORS ValidationPipe whitelist | `apps/api/src/**` | api-skeleton#Prefix | 1.5h | Ph1,2.1
- [x] 3.2 Implement `modules/health` GET /health 200 {status:"ok"} | `apps/api/src/modules/health/**` | api-skeleton#Health | 0.5h | 3.1
- [x] 3.3 Implement `config/env.schema.ts` Zod DATABASE_URL PORT CORS_ORIGIN fail-fast | `apps/api/src/config/**` | api-skeleton#Env | 0.5h | 3.1
- [x] 3.4 Verify health 200 + ValidationPipe 400 extra prop + missing env fail | — | api-skeleton Scenarios | 0.5h | 3.2-3.3

## Phase 4: Persistence Foundation

- [x] 4.1 Create `docker-compose.yml` postgres:16-alpine pg_isready pgdata + `.env.example` | `docker-compose.yml`,`.env.example` | persistence#Docker | 0.5h | Ph1
- [x] 4.2 Create `prisma/schema.prisma` postgresql env(DATABASE_URL) Role enum User | `prisma/schema.prisma` | persistence#Prisma | 0.5h | 4.1
- [x] 4.3 Add scripts db:up/down/migrate/generate + README docs | `package.json`,`README.md` | persistence SC | 0.25h | 4.2
- [x] 4.4 Verify compose healthy + `prisma migrate dev` + generate + missing URL fail | — | persistence Scenarios | 0.5h | 4.1-4.3

## Phase 5: Quality Gates + CI

- [x] 5.1 Configure ESLint flat + Prettier root+workspace overrides | `eslint.config.js`,`.prettierrc*` | quality-gates#Lint | 1h | Ph1-4
- [x] 5.2 Configure Vitest workspace coverage-v8 happy-dom + placeholder tests | `vitest.*` | quality-gates#Test | 1h | 5.1
- [x] 5.3 Create `.github/workflows/ci.yml` Node20 install lint typecheck test build | `.github/workflows/ci.yml` | quality-gates#CI | 0.5h | 5.1-5.2
- [x] 5.4 (Optional) Husky + lint-staged pre-commit | `.husky/**` | quality-gates#Pre-commit | 0.5h | 5.1
- [x] 5.5 Verify lint non-zero + typecheck fail + test+build green + CI green | — | quality-gates Scenarios | 0.5h | 5.1-5.3

## Delivery Strategy

auto-chain: 5 stacked PRs to master sequentially. Each PR has start/end, deps, follow-up, out-of-scope, diagram * current. Split further if >400 lines (e.g., 2a shared 2b web). `pnpm-lock.yaml` may need size:exception. Rollback `git revert` reverse; persistence `docker compose down -v` + `prisma migrate reset`.

## Traceability

| Tasks | Spec | Scenarios |
|-------|------|-----------|
| 1.1-1.6 | monorepo-workspace | Clean clone, Wrong Node, Typecheck propagates |
| 2.1-2.2 | shared-kernel | Shared import, Invalid DTO fails |
| 2.3-2.5 | web-shell | Home es-CO, Manifest served, Responsive |
| 3.1-3.4 | api-skeleton | Health 200, Validation 400, Missing env fail |
| 4.1-4.4 | persistence-foundation | DB healthy, Migrate ok, Missing URL fail |
| 5.1-5.5 | quality-gates | Lint catch, Type block, CI pass, Pre-commit opt |
