# Design: maison-fraise-foundation — FASE 1 Fundación

## Technical Approach

Greenfield monorepo: pnpm workspaces root with `apps/web` (Next.js 14+ App Router PWA, es-CO), `apps/api` (NestJS hexagonal, /api/v1), `packages/shared` (Zod kernel). Docker Postgres 16 + Prisma. ESLint flat, Prettier, tsc, Vitest, CI. Free-tier only, hexagonal from day one. Covers 6 delta specs: monorepo-workspace, web-shell, api-skeleton, shared-kernel, persistence-foundation, quality-gates.

```
 Root (pnpm+turbo) ──┬─ apps/web → Next.js PWA (manifest, lang=es)
                     ├─ apps/api → NestJS (/api/v1/health, ValidationPipe)
                     └─ packages/shared → Zod DTOs (single source)
                              ↕ Prisma Client ↕ docker-compose pg:16
```

## Architecture Decisions

| Decision | Chosen | Rejected | Rationale |
|----------|--------|----------|-----------|
| pnpm vs npm | **pnpm 9+** | npm/yarn | Strict isolation, no phantom deps, faster; needed for shared linking |
| Tasks | **Turborepo + pnpm -r** | Nx | Cached pipelines, zero-config; fallback to pnpm -r |
| Frontend | **Next.js 14 App Router** | Remix | Vercel-native, PWA/manifest mature, es-CO i18n built-in |
| Backend | **NestJS hexagonal** | Express raw | Modules/DI/ValidationPipe, domain ports/adapters future-proof |
| Validation | **Zod kernel** | class-validator | Isomorphic runtime + `z.infer` types, one DTO source |
| ORM | **Prisma** | TypeORM | Typed client, `migrate/generate`, `env(DATABASE_URL)` DX |
| DB local | **docker-compose pg:16** | Neon-only/sqlite | Reproducible, healthcheck+volume; prod via DATABASE_URL swap |
| Tests | **Vitest + coverage-v8** | Jest | ESM-native, shared config for web/api |
| Lint | **ESLint flat + Prettier** | legacy | Future-proof, strict TS catches cross-package breaks |

Hexagonal: `shared` = kernel (no infra deps). `apps/api` → `modules/{health,config}` → domain pure → `infrastructure/prisma`. Web: `app/` + atomic shell `components/{atoms,molecules,organisms}`; container/presentational deferred.

## Data Flow

```
[Browser es-CO] GET / → Next.js (layout lang=es, manifest standalone) → shared constants
              └ GET /api/v1/health → NestJS (CORS, ValidationPipe) → HealthModule {status:"ok"}
                                    → ConfigModule Zod fail-fast → Prisma → pg:16 (pgdata)
```
Health: `Client → Controller → Service → {status:"ok"}`. Env: `zod.parse(process.env)` at boot, fails before `listen`.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `pnpm-workspace.yaml` | Create | `["apps/*","packages/*"]` |
| `package.json` root | Create | `packageManager pnpm@9`, `engines node>=20`, scripts `build/test/lint/typecheck/db:{up,down}` |
| `turbo.json` | Create | `build→^build`, `test/lint/typecheck` cached |
| `tsconfig.base.json` | Create | Strict, ESNext, bundler, `@maison-fraise/shared` path |
| `apps/web/**` | Create | `app/layout.tsx`, `page.tsx` (es-CO placeholder), `manifest.ts`, `next.config.js`, `public/icons` |
| `apps/api/**` | Create | `main.ts` (prefix /api/v1, ValidationPipe whitelist), `app.module.ts`, `modules/health`, `config/env.schema.ts` |
| `packages/shared/**` | Create | `schemas/{health,pagination}.ts`, `constants/{roles,locale}.ts` (Zod) |
| `docker-compose.yml` | Create | `postgres:16-alpine`, `pg_isready`, volume `pgdata` |
| `prisma/schema.prisma` | Create | `postgresql env(DATABASE_URL)`, `Role enum`, `User` skeletal |
| `.env.example` | Create | `DATABASE_URL`, `PORT`, `CORS_ORIGIN` (no secrets) |
| ESLint/Prettier | Create | Flat config root + per-workspace overrides |
| `vitest.*` | Create | Workspace config, coverage-v8 |
| `.github/workflows/ci.yml` | Create | install→lint→typecheck→test→build Node 20 |
| `.gitignore`/`README.md` | Modify/Create | Add `node_modules/.next/dist/.env/coverage`, setup docs |

## Interfaces / Contracts

```ts
// shared — isomorphic
export const Role = z.enum(["admin","seller","delivery"]);
export const HealthResponse = z.object({ status: z.literal("ok") });
export const PaginationDto = z.object({ page: z.coerce.number().min(1).default(1), limit: z.coerce.number().max(100).default(20) });
export const LOCALE="es-CO", CURRENCY="COP";

// api env — fail-fast
export const envSchema = z.object({ DATABASE_URL: z.string().url(), PORT: z.coerce.number().default(3001), CORS_ORIGIN: z.string().default("http://localhost:3000") });
// GET /api/v1/health → 200 {status:"ok"}
```
```prisma
datasource db { provider="postgresql" url=env("DATABASE_URL") }
generator client { provider="prisma-client-js" }
enum Role { admin seller delivery }
model User { id String @id @default(cuid()); email String @unique; role Role @default(seller); createdAt DateTime @default(now()) }
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | Zod schemas, env validation, HealthService | Vitest `safeParse` |
| Integration | `GET /health` 200, ValidationPipe 400 | `supertest` + `happy-dom` for web |
| Quality | `lint/typecheck/build` pass, CI green | GH Actions Node 20 |

E2E (Playwright) deferred to FASE 2. Coverage 70% enforced after domain code.

## Threat Matrix

N/A — no custom routing/shell/subprocess/VCS automation or executable classification. Framework routing only (`App Router`, `setGlobalPrefix`). No user-supplied path/shell interpolation. No RED tests for this phase.

## Migration / Rollout

No migration; additive. Rollback: `git revert` stacked PRs reverse; `docker-compose down -v` + `prisma migrate reset`. Deploy free-tier: web→Vercel, api→Render/Railway/Fly, DB→Neon/Supabase via `DATABASE_URL`. Env: `.env.example` committed, `.env` ignored, Zod validates at boot. Security: `ValidationPipe {whitelist, forbidNonWhitelisted, transform}`, CORS allowlist, optional `helmet`, bcrypt/JWT plan only, no secrets in repo/CI.

## Open Questions

- [ ] `User` fields beyond `email/role` before FASE 2?
- [ ] Need `customer` role sooner? Affects RBAC matrix.
- [ ] Keep Turborepo or `pnpm -r` alone for 3 workspaces?
- [ ] Husky/lint-staged now or after first domain PR?
