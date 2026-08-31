# MAISON FRAISE — fresas-con-crema

> Private sales / order / inventory / delivery system for strawberry desserts in Sabanalarga, Colombia.

## Project Context

- **Repo**: https://github.com/Joserafa20/Fresas-con-Crema.git
- **Branch**: `master` (no commits yet, remote empty)
- **Artifact store**: `hybrid` (openspec files + Engram)
- **Initialized**: 2026-08-31 via `sdd-init`

## Vision

MAISON FRAISE sells strawberry desserts via private/closed sales. The system must manage the full lifecycle:
catalog → inventory (perishable) → orders → payments (COP) → preparation → delivery/collection in Sabanalarga → customer history.

## Recommended Foundation Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | **Next.js 14+ + TypeScript + PWA** | App Router, SSR/ISR, PWA installable, offline queue for orders, Spanish locale |
| Backend | **NestJS + TypeScript** | Modular, Prisma-friendly, validation (class-validator), JWT auth |
| DB | **PostgreSQL + Prisma ORM** | Low-cost free tiers (Neon, Supabase, Railway), strong typing |
| Monorepo | **pnpm workspaces + Turborepo (optional)** | `apps/web`, `apps/api`, `packages/shared` (DTOs, types, validation) |
| Auth | JWT (access+refresh), bcrypt, role-based (admin, seller, delivery) | No paid auth service |
| Storage | Local filesystem / free-tier S3-compatible (Cloudinary free / Supabase Storage) | Product images |
| Deployment (free-tier) | Vercel (web) + Render/Railway/Fly (api) + Neon/Supabase Postgres | Zero cost, hybrid deploy |
| PWA | `next-pwa` or native `next` PWA support + Workbox | Offline catalog + deferred order sync |

## Architecture Principles

- **Hexagonal / Clean**: Domain core isolated from NestJS/Next.js infra.
- **Atomic Design** (web): atoms → molecules → organisms → templates.
- **Container/Presentational** on web where useful.
- **Low-cost constraint**: No paid SaaS. Prefer self-hostable / generous free tier.
- **Locale**: `es-CO`, currency `COP`, timezone `America/Bogota`.

## Proposed Monorepo Layout

```
fresas-con-crema/
├── apps/
│   ├── web/                 # Next.js PWA (TypeScript)
│   └── api/                 # NestJS (TypeScript)
├── packages/
│   └── shared/              # Shared DTOs, zod schemas, constants
├── openspec/                # SDD specs (this)
├── .atl/                    # Skill registry
├── pnpm-workspace.yaml
├── turbo.json               # optional
└── docker-compose.yml       # local Postgres
```

## Conventions

- **Language**: Code/comments/docs in English. UI copy in Spanish (es-CO).
- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, etc.), no AI attribution.
- **Branching**: `master` (main) + `feat/*` / `fix/*` — stacked-to-main, PRs < 400 lines, chain strategy auto-chain.
- **Review budget**: 800 lines per review slice.
- **SDD flow**: `sdd-init` → `sdd-explore` → `sdd-propose` → `sdd-spec` → `sdd-design` → `sdd-tasks` → `sdd-apply` → `sdd-verify` → `sdd-archive`.

## Testing Strategy (Proposed)

- **Runner**: Vitest (web + api), `pnpm test`, `pnpm coverage` via `@vitest/coverage-v8`
- **Unit**: Vitest + happy-dom/jsdom
- **Integration**: `@testing-library/react` (web), `supertest` (api)
- **E2E (later)**: Playwright
- **Quality**: ESLint + `tsc --noEmit` + Prettier + Husky/lint-staged (optional)
- **Strict TDD**: `false` until runners land; flip to `true` once `pnpm test` exists.

## Delivery Strategy

- `pace=auto`, `delivery_strategy=auto-chain`, `chain_strategy=stacked-to-main`, `review_budget_lines=800`
- Bootstrap change should be `bootstrap-foundation` (monorepo + tooling + CI + skeleton).

## Next Step

Run `/sdd-explore bootstrap-foundation` or `/sdd-new bootstrap-foundation` to kick off the foundation change.
