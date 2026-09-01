# Delta for api-skeleton

## Overview

Extends NestJS skeleton with catalog domain modules under `/api/v1`; preserves health, validation, and env baseline while adding catalog routes, RBAC, and DB wiring.

## ADDED Requirements

### Requirement: Catalog Modules under /api/v1

The system SHALL add NestJS `CatalogModule` (or `ProductsModule`/`VariantsModule`/`ToppingsModule`/`MediaModule`) mounted under global prefix `/api/v1`; catalog routes MUST follow REST conventions (`/products`, `/products/:id`, `/products/:id/images`, `/variants`, `/toppings`).

#### Scenario: Catalog route reachable

- GIVEN API is running
- WHEN client calls `GET /api/v1/products`
- THEN response is 200 (or 204 empty) with JSON

#### Scenario: Unknown catalog route 404

- GIVEN API is running
- WHEN client calls `GET /api/v1/products/unknown-id-xyz`
- THEN 404

### Requirement: Catalog RBAC Guard

The system SHALL enforce `admin`-only for catalog mutations via guard/decorator; reads MAY be public but admin writes MUST return 403 for non-admin.

#### Scenario: Admin mutation allowed

- GIVEN admin token
- WHEN `POST /api/v1/products`
- THEN 201

#### Scenario: Customer mutation blocked

- GIVEN customer token (no admin role)
- WHEN `POST /api/v1/products`
- THEN 403

### Requirement: Catalog Persistence Wiring

The system SHALL wire catalog entities via Prisma through `persistence-foundation`; queries for customer catalog MUST filter `isActive=true` and include relations efficiently (no N+1), with pagination where list may grow.

#### Scenario: Customer list avoids N+1

- GIVEN 10 products each with variants/images
- WHEN `GET /api/v1/products` executes
- THEN query count is bounded (e.g. single Prisma `include`, not N+1)

## MODIFIED Requirements

### Requirement: NestJS Application and Versioned Prefix

The system SHALL scaffold `apps/api` with NestJS TypeScript, global prefix `/api/v1`, CORS enabled, and global `ValidationPipe` (whitelist, forbidNonWhitelisted, transform). Catalog modules SHALL be registered under this prefix and inherit the same validation/CORS behavior.
(Previously: skeleton only mentioned health/validation without catalog modules)

#### Scenario: Health endpoint returns 200

- GIVEN the API is running
- WHEN the client calls `GET /api/v1/health`
- THEN the response is 200 with `{ status: "ok" }` and JSON content-type

#### Scenario: Validation rejects unknown properties

- GIVEN ValidationPipe is enabled
- WHEN a request body contains an extra property not in the DTO (including catalog DTOs)
- THEN the API responds 400 with a validation error

### Requirement: Configuration and Env Validation

The system SHALL load configuration via `@nestjs/config` and validate required env vars with Zod at startup, failing fast on missing values; catalog-related env (e.g. `DATABASE_URL`, optional storage URL) SHALL also be validated; no secrets SHALL be committed.
(Previously: config validation covered only foundation env vars)

#### Scenario: Missing env fails fast

- GIVEN a required env var is absent
- WHEN the API starts
- THEN startup fails with a descriptive validation error

## Non-goals

- Orders/payments/inventory/delivery modules; production deploy beyond foundation.

## Dependencies

- `monorepo-workspace`, `shared-kernel`, `persistence-foundation`, `product-catalog`, `catalog-pricing`, `catalog-media`.

## Success Criteria

- `GET /api/v1/products` and `/health` both 200; catalog mutations gated by RBAC; ValidationPipe applies to catalog DTOs; `pnpm --filter api build` passes.
