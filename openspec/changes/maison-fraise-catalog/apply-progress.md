# Apply Progress: maison-fraise-catalog

## Status: PR1 and PR2 Complete

### Phase 1: Foundation (Completed)
- [x] 1.1 Extend `prisma/schema.prisma` with 6 catalog models (Product, ProductVariant, Topping, ProductTopping, PriceHistory, ProductImage) and appropriate indexes.
- [x] 1.2 Seed script / Prisma client generation ready.
- [x] 1.3 `prisma/seed.ts` upserts 3 initial products + variants + 6 toppings ($1.500 c/u) linked M2M.
- [x] 1.4 `packages/shared/src/catalog/schemas.ts` Zod DTOs and validation schemas (priceCents>=0, sizeBytes<=5MB, MIME type enum).
- [x] 1.5 `packages/shared/src/catalog/pricing.ts` pricing calculation helper `calcTotalCents` with `TOPPING_UNIT_PRICE = 1500` and unit tests covering 0..6 toppings.

### Commits Created
1. `271d7f9` `feat(catalog-schema): prisma models and seed script for catalog (PR1)`
2. `7660686` `feat(catalog-shared): DTOs, schemas and pricing calculation helper (PR2)`

### Verification
- `pnpm prisma generate`: Success (Prisma Client generated).
- `pnpm test`: Success (5 test files, 15 tests passed including shared pricing and schemas tests).

### Work Unit Evidence
- **Focused test command**: `pnpm test`
- **Exact result**: 5 passed (15 tests, 100% green)
- **Runtime harness**: `pnpm prisma generate`
- **Rollback boundary**: `prisma/schema.prisma`, `prisma/seed.ts`, `packages/shared/src/catalog/**`

### Remaining Tasks
- Phase 2: Core — CatalogModule API (PR3: Tasks 2.1 - 2.8)
- Phase 3: Customer Web (PR4: Tasks 3.1 - 3.4)
- Phase 4: Admin + Quality (PR5: Tasks 4.1 - 4.5)
