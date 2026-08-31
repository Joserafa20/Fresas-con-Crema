# MAISON FRAISE — Fresas con Crema

Private sales / order / inventory / delivery for strawberry desserts — Sabanalarga, Colombia.

**Stack**: pnpm workspaces · Next.js 14 (PWA, es-CO) · NestJS · PostgreSQL + Prisma · Vitest · ESLint + Prettier

**Constraints**: Free-tier only (Vercel / Render / Railway / Neon / Supabase-free). PWA installable, `es-CO` / `COP` / `America/Bogota`.

## Prerequisites

- Node.js 20+ (`nvm use` reads `.nvmrc`)
- pnpm 9+ (`corepack enable && corepack prepare pnpm@9 --activate` or `npm i -g pnpm@9`)
- Docker (for Postgres)

## Quick Start

```bash
cp .env.example .env        # fill DATABASE_URL etc.
pnpm install
pnpm db:up                  # docker compose up -d
pnpm prisma:generate
pnpm prisma:migrate         # prisma migrate dev
pnpm dev                    # web :3000, api :3001
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Run all workspaces in dev |
| `pnpm build` | Build all workspaces |
| `pnpm test` | Run tests (Vitest) |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier check |
| `pnpm format:write` | Prettier write |
| `pnpm typecheck` | tsc --noEmit |
| `pnpm db:up` / `db:down` | Postgres via docker compose |
| `pnpm prisma:generate` | Prisma generate |
| `pnpm prisma:migrate` | Prisma migrate dev |

## Project Structure

```
apps/web        Next.js 14 App Router PWA (es-CO)
apps/api        NestJS (/api/v1, ValidationPipe, Zod env)
packages/shared Zod DTOs / constants (single source of truth)
prisma/         schema.prisma + migrations
```

## Env

See `.env.example`. Never commit `.env`. API validates env with Zod at boot (fail-fast).

## Deployment (free-tier)

- Web → Vercel
- API → Render / Railway / Fly
- DB → Neon / Supabase — swap `DATABASE_URL`

## License

Private — all rights reserved.
