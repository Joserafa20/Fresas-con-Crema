# Delta for shared-kernel

## Overview

Extends `packages/shared` with catalog DTOs, Zod schemas, and pricing helpers so web and api share validation and `base+1500*n` logic without duplication.

## ADDED Requirements

### Requirement: Catalog DTOs and Zod Schemas

The system SHALL export catalog Zod schemas and inferred types for `Product`, `Variant`, `Topping`, `ProductImage`, `PriceHistory` and create/update DTOs; all schemas MUST validate `priceCents >=0`, `sizeBytes <=5MB`, MIME enum, and `sortOrder` integer.

#### Scenario: Valid product DTO passes

- GIVEN payload with `name`, `isActive`, `sortOrder`, variants
- WHEN `productSchema.safeParse(payload)` runs
- THEN success true

#### Scenario: Invalid price rejected

- GIVEN payload with `priceCents: -1`
- WHEN schema parses
- THEN success false with issue on `priceCents`

#### Scenario: Invalid MIME rejected

- GIVEN image DTO with `mimeType: "image/gif"`
- WHEN schema parses
- THEN success false

### Requirement: Pricing Helpers

The system SHALL export `calcTotalCents(baseCents, toppingCount)` returning `baseCents + 1500 * toppingCount` and `TOPPING_UNIT_PRICE = 1500`; helper MUST be pure and used by both web (live total) and api (server recompute).

#### Scenario: Helper computes total

- GIVEN `calcTotalCents(12000, 2)`
- WHEN called
- THEN returns 15000

#### Scenario: Zero toppings returns base

- GIVEN `calcTotalCents(15000, 0)`
- WHEN called
- THEN returns 15000

## MODIFIED Requirements

### Requirement: Shared Package Exports

The system SHALL expose `packages/shared` as a workspace package exporting DTOs, Zod schemas, and constants (roles `admin|seller|delivery`, locale `es-CO`, currency `COP`, plus catalog exports) importable by both `apps/web` and `apps/api`.
(Previously: exports only listed roles/locale/currency/health without catalog)

#### Scenario: Shared import works in both apps

- GIVEN `packages/shared` is built
- WHEN `apps/web` and `apps/api` import `{ Roles }` or catalog schemas from `@maison-fraise/shared`
- THEN import resolves and types are available

### Requirement: Zod Validation Schemas

The system SHALL define Zod schemas for shared DTOs (health, pagination, plus catalog) and re-export them; schemas MUST validate at runtime and provide TypeScript types via `z.infer`.
(Previously: only health/pagination examples)

#### Scenario: Invalid DTO fails validation

- GIVEN a Zod schema for a shared DTO requires `email` as email
- WHEN `schema.safeParse({ email: "bad" })` is called
- THEN the result is `success: false` with an issue on `email`

## Non-goals

- UI components, business workflows beyond catalog.

## Dependencies

- `monorepo-workspace` (tsconfig, pnpm). No runtime services.

## Success Criteria

- `packages/shared` builds and catalog schemas/helpers importable from web/api; `calcTotalCents` tested; no duplicated DTOs across apps.
