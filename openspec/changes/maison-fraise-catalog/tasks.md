# Tasks: maison-fraise-catalog — FASE 2 Catalog

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1350-1600 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1 Schema+Seed → PR2 Shared → PR3 API → PR4 Customer → PR5 Admin+Quality |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | PR | Test | Runtime | Rollback |
|------|------|----|------|---------|----------|
| 1 | Prisma 6 models + seed 3 prod/6 toppings | PR1 | `prisma validate` | `migrate deploy && db:seed` | `schema.prisma`, `seed.ts` |
| 2 | Shared Zod + pricing | PR2 | `pnpm --filter shared test` | `pnpm --filter shared build` | `packages/shared/src/catalog/**` |
| 3 | CatalogModule CRUD/RBAC/history/media | PR3 | `pnpm --filter api test` | `curl /api/v1/products` | `apps/api/src/catalog/**` |
| 4 | Customer ISR + picker live total | PR4 | `pnpm --filter web build` | `/catalog` 375px | `app/catalog/**`, `components/catalog/**` |
| 5 | Admin CRUD + upload + gates | PR5 | `pnpm test && pnpm build` | `/admin/catalog` CRUD | `app/admin/catalog/**`, `ci.yml` |

## Phase 1: Foundation — Schema, Seed, Shared Kernel

- [x] 1.1 Extend `prisma/schema.prisma` 6 models + indexes
- [x] 1.2 Migration `catalog_init` additive
- [x] 1.3 `prisma/seed.ts` upsert 3 products/variants + 6 toppings M2M
- [x] 1.4 `packages/shared/src/catalog/schemas.ts` Zod priceCents>=0 size<=5MB mime enum
- [x] 1.5 `packages/shared/src/catalog/pricing.ts` `TOPPING_UNIT=1500` `calcTotalCents` tests 0..6

## Phase 2: Core — CatalogModule API

- [ ] 2.1 Scaffold `apps/api/src/catalog/catalog.module.ts` hexagonal
- [ ] 2.2 `catalog/domain/` entities + `ports/product.repository.ts`
- [ ] 2.3 `catalog/infra/prisma-product.repository.ts` findActive include no N+1
- [ ] 2.4 `catalog/application/catalog.service.ts` Tx create + price Tx history append
- [ ] 2.5 `catalog/presentation/catalog.controller.ts` `/api/v1/products|variants|toppings|images` history DESC
- [ ] 2.6 `catalog/guards/roles.guard.ts` `@Roles('admin')` ZodValidationPipe
- [ ] 2.7 `POST /products/:id/images` Multer jpeg/png/webp 5MB sharp 800w url+metadata
- [ ] 2.8 Wire `app.module.ts` + `ci.yml` grep `10000|12000|15000`

## Phase 3: Customer Web

- [ ] 3.1 `apps/web/app/catalog/page.tsx` ISR revalidate:60 active ordered
- [ ] 3.2 `components/catalog/ProductCard.tsx` next/image 375px no overflow
- [ ] 3.3 `app/catalog/[slug]/page.tsx` picker + ToppingSelector + live calcTotalCents 404 if inactive
- [ ] 3.4 `next.config.js` remotePatterns sharp; PWA SWR catalog NetworkOnly admin

## Phase 4: Admin + Quality

- [ ] 4.1 `app/admin/catalog/page.tsx` NetworkOnly toggle isActive sortOrder
- [ ] 4.2 `app/admin/catalog/[id]/page.tsx` edit variants/toppings/price history
- [ ] 4.3 Admin upload multipart + MIME/size check
- [ ] 4.4 Supertest: active ordered, RBAC 403/201, MIME 400, history append, N+1
- [ ] 4.5 Playwright: 375px, picker 12000+3000, admin CRUD; `pnpm build/test` green

## Dependency Graph

```
PR1 ─┐
     ├→ PR3 → PR4 → PR5
PR2 ─┘ (PR2→PR4)
```
Order 1→2→3→4→5; 3 needs 1+2.

## Spec Mapping

| Spec | Tasks |
|------|-------|
| product-catalog (visibility/variant/M2M/RBAC) | 1.1,1.3,2.3,2.4,2.6,3.1,4.4 |
| catalog-pricing (DB/history/base+1500*n) | 1.1,1.5,2.4,2.5,3.3 |
| catalog-media (MIME/size/url/active/opt) | 1.1,2.7,3.2,4.3,4.4 |
| api-skeleton (/api/v1/guard/N+1) | 2.1,2.5,2.6,2.3 |
| shared-kernel (Zod/helpers) | 1.4,1.5 |
| web-shell (ISR/375px/PWA) | 3.1,3.2,3.4,4.5 |
