# Proposal: maison-fraise-catalog — FASE 2 Catalog

> Engram `sdd/maison-fraise-catalog/proposal`. Pace auto. §§8-10,39-43.

## Intent
Mobile-first catalog: customers browse products/variants/toppings with live DB prices; admin edits without deploys. Prices MUST be DB-backed with history.

## Scope

### In Scope
- Products: Crema 9/12/16oz ($10k/$12k/$15k), Bowl Chocolate $15k, Oreo 12oz $12.5k; `isActive`, `sortOrder`, description
- Variants per product with COP price
- 6 toppings $1.500 (Oreo, Quipitos, Leche polvo, Piazza, Chip negro, M&M), per-product M2M, combinable `base+1500*n`
- Price history append-only (`effectiveFrom`)
- Photos: MIME/ext/size validation, URL+metadata in PG, resize/compress
- Customer catalog: list/detail active-only ordered, responsive ISR
- Admin CRUD: products/variants/toppings/photos/prices/active/order (RBAC)
- Seed for 3 products + variants + toppings

### Out of Scope
- Cart/orders/payments/inventory/delivery, storage provider, search/reviews

## Capabilities

### New Capabilities
- `product-catalog`: model + customer read API/UI
- `catalog-pricing`: DB prices, history, topping calc
- `catalog-media`: photo validation, URL/metadata, optimization

### Modified Capabilities
- `api-skeleton`: `/api/v1` catalog modules
- `web-shell`: `/catalog` routes + PWA cache
- `shared-kernel`: catalog DTOs/zod, pricing helpers

## Approach
Prisma `Product/Variant/Topping/ProductTopping/PriceHistory/ProductImage`. NestJS `CatalogModule` (hexagonal). Next.js `/catalog` ISR + detail picker live total. `image/jpeg|png|webp` ≤5MB. Stacked PRs: (1) schema+seed, (2) API CRUD, (3) customer web, (4) admin UI.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `prisma/schema.prisma`, `seed.ts` | Modified | Catalog tables + seed |
| `apps/api/src/catalog/**` | New | Catalog module |
| `apps/web/app/catalog/**`, `components/catalog/**` | New | Customer UI |
| `apps/web/app/admin/catalog/**` | New | Admin CRUD |
| `packages/shared/src/catalog/**` | New | DTOs/zod helpers |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Hardcoded prices | Med | CI grep, DB-only |
| Image abuse | Med | MIME+size, URL-only |
| Scope creep to orders | High | Strict FASE 2 boundary |
| N+1 query | Low | `include` + pagination |

## Rollback Plan
Revert PRs reverse; `prisma migrate reset` drops tables. Seed re-runnable. No prod data.

## Dependencies
`maison-fraise-foundation` merged. Node 20+, Docker. No paid services.

## Success Criteria
- [ ] `GET /api/v1/products` active ordered with variants/toppings/images; admin gated
- [ ] Prices DB-only, history append-only, `base+1500*n` correct
- [ ] Bad MIME/size rejected; URL/metadata not blob
- [ ] `/catalog` mobile-first 375px, optimized, PWA cached
- [ ] Seed 3 products+variants+6 toppings; `pnpm build/test` green

## Cost & PWA Note
Zero-cost: PG URL refs, sharp/next/image, Supabase free optional. PWA caches catalog SWR; admin online.

## Proposal Question Round (pace=auto)

**Assumptions:** 1) Toppings unlimited $1.500. 2) Orders snapshot price FASE 3. 3) CRUD `admin` only. 4) 1-5 photos, first=cover. 5) `isActive` only.

**Questions:** 1) Max toppings/combos? 2) Instant vs scheduled `effectiveFrom`? 3) `seller` edit? 4) Cover manual vs auto? 5) Draft beyond toggle?
