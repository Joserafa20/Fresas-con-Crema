# Design: maison-fraise-catalog — FASE 2 Catalog

## Technical Approach

Catalog adds DB-backed products/variants/toppings/photos via hexagonal `CatalogModule`. Prisma 6 models + indexes; API `/api/v1/products|variants|toppings|images` with `admin` guard and shared Zod; web `/catalog` ISR + `/catalog/[slug]` live `calcTotalCents` + `/admin/catalog` online-only. Shared kernel single source. Zero-cost sharp resize, URL-only photos. Stacked PRs: schema+seed → API CRUD → customer web → admin UI.

```
apps/api ─ CatalogModule (hex) ─ Prisma ─ pg:16
apps/web ─ /catalog ISR + /[slug] picker + /admin/catalog
packages/shared ─ DTOs + TOPPING_UNIT=1500 + calcTotalCents
```

## Architecture Decisions

| Decision | Chosen | Rejected | Rationale |
|----------|--------|----------|-----------|
| M2M | **Explicit `ProductTopping` @@unique** | Implicit M2M | Per-product toggle, extensible |
| Price history | **Append-only insert, no update/delete API** | In-place update | Audit, spec immutability |
| FK deletes | **Cascade variants/images/history, Restrict future orders** | SetNull | Variants meaningless alone |
| Hexagonal | **domain/ports + application + infra(Prisma) + presentation** | Fat controllers | Follows `modules/health`, testable |
| Validation | **Zod shared + ZodValidationPipe** | class-validator | Isomorphic, foundation Zod env |
| Photos | **Multer fileFilter + 5MB + sharp 800w → URL+metadata** | Blob PG | Spec forbids blobs, zero-cost |
| Pricing | **Pure `calcTotalCents`, server recomputes** | Trust client total | Security `base+1500*n` |
| Web | **ISR revalidate 60 + next/image, PWA SWR catalog, admin NetworkOnly** | SSR only | Perf + 375px mobile-first |
| RBAC | **RolesGuard + @Roles('admin') JWT** | Middleware | NestJS idiomatic |

## Data Flow

Customer read:
```
Browser → GET /catalog (ISR revalidate:60) → fetch GET /api/v1/products?isActive
 → CatalogController → CatalogService → ProductRepo.findActive(include variants/toppings/images where isActive, order sortOrder)
 → 200 JSON → Server Component → next/image + client calcTotalCents picker
```

Admin create:
```
Admin form → POST /api/v1/products (Bearer admin)
 → JwtAuthGuard → RolesGuard → ZodValidationPipe → CatalogService.create
 → Prisma Tx: Product + Variants + ProductTopping + PriceHistory per variant → 201
Image: POST /products/:id/images multipart → Multer MIME/size check → sharp → ProductImage row → 201
Price: PATCH /variants/:id {priceCents} → Tx update variant + insert PriceHistory → GET /variants/:id/price-history DESC
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modify | 6 models + indexes |
| `prisma/seed.ts` | Create | 3 products + variants + 6 toppings + links |
| `packages/shared/src/catalog/*` | Create | schemas.ts, dto.ts, pricing.ts, index.ts |
| `apps/api/src/catalog/**` | Create | catalog.module, domain, ports, services, repos, controllers, guards, decorators |
| `apps/api/src/app.module.ts` | Modify | Import CatalogModule |
| `apps/web/app/catalog/page.tsx` | Create | ISR list active ordered |
| `apps/web/app/catalog/[slug]/page.tsx` | Create | Detail picker live total |
| `apps/web/components/catalog/*` | Create | ProductCard, VariantPicker, ToppingSelector |
| `apps/web/app/admin/catalog/**` | Create | Admin CRUD network-only |
| `next.config.js` | Modify | images.remotePatterns + sharp |
| `.github/workflows/ci.yml` | Modify | Hardcoded price grep |

## Interfaces / Contracts

```prisma
model Product { id String @id @default(cuid()); slug String @unique; name String; description String?; isActive Boolean @default(true); sortOrder Int @default(0); variants ProductVariant[]; toppings ProductTopping[]; images ProductImage[]; @@index([isActive, sortOrder]) }
model ProductVariant { id String @id @default(cuid()); productId String; name String; priceCents Int; isActive Boolean @default(true); product Product @relation(fields:[productId],references:[id],onDelete:Cascade); history PriceHistory[]; @@index([productId]) }
model Topping { id String @id @default(cuid()); name String @unique; priceCents Int @default(1500); products ProductTopping[]; }
model ProductTopping { productId String; toppingId String; product Product @relation(onDelete:Cascade); topping Topping @relation(onDelete:Cascade); @@id([productId,toppingId]) }
model PriceHistory { id String @id @default(cuid()); variantId String; priceCents Int; effectiveFrom DateTime @default(now()); variant ProductVariant @relation(onDelete:Cascade); @@index([variantId, effectiveFrom(sort:Desc)]) }
model ProductImage { id String @id @default(cuid()); productId String; url String; mimeType String; sizeBytes Int; width Int?; height Int?; sortOrder Int @default(0); isActive Boolean @default(true); product Product @relation(onDelete:Cascade); @@index([productId, sortOrder]) }
```
```ts
export const TOPPING_UNIT_PRICE = 1500;
export const calcTotalCents = (b:number,n:number)=> b + TOPPING_UNIT_PRICE * n;
export const imageSchema = z.object({ url:z.string().url(), mimeType:z.enum(["image/jpeg","image/png","image/webp"]), sizeBytes:z.number().max(5*1024*1024) });
// GET /products →200; POST @Roles(admin)→201; PATCH /variants/:id →Tx; GET /price-history →200 DESC
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | Zod price/MIME/5MB, `calcTotalCents` 0..6 | Vitest safeParse |
| Integration | GET active ordered, RBAC 403/201, history append, MIME 400, no N+1 include | Supertest Prisma test DB |
| E2E | /catalog 375px, ISR, picker total, next/image, admin CRUD | Playwright |

CI grep fails on `10000|12000|15000` outside seed/topping constant.

## Threat Matrix

N/A — framework routing only; upload allowlist, URL-only, RBAC server-side. No RED tests.

## Migration / Rollout

Additive migrate. Rollback `migrate reset` + revert PRs. Seed upsert by slug. PWA catalog SWR, admin NetworkOnly.

## Open Questions

- [ ] Cover: first sortOrder auto vs `coverImageId`?
- [ ] `effectiveFrom` instant vs scheduled?
- [ ] `seller` edit? Spec admin-only.
- [ ] Seed image URLs source (placeholder vs Supabase bucket)?
```
