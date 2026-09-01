# Delta for shared-kernel

## Overview

Add order-related DTOs, Zod validation schemas, status enums, and payment method enums to `packages/shared` for cross-app import by web and api.

## MODIFIED Requirements

### Requirement: Shared Package Exports

The system SHALL expose `packages/shared` as a workspace package exporting DTOs, Zod schemas, and constants (roles `admin|seller|delivery`, locale `es-CO`, currency `COP`, order statuses, payment statuses, payment methods, order origins) importable by both `apps/web` and `apps/api`.

(Previously: Exported roles, locale, currency only — no order-related exports)

#### Scenario: Shared import works in both apps

- GIVEN `packages/shared` is built
- WHEN `apps/web` and `apps/api` import `{ Roles }` from `@maison-fraise/shared` (or `packages/shared`)
- THEN the import resolves and types are available

#### Scenario: Order enums importable

- GIVEN `packages/shared` exports `OrderStatus`, `PaymentStatus`, `PaymentMethod`, `OrderOrigin`
- WHEN api and web import these enums
- THEN types are available and match Prisma enum values

### Requirement: Zod Validation Schemas

The system SHALL define Zod schemas for shared DTOs (e.g., health response, pagination, order creation, order status update, payment update) and re-export them; schemas MUST validate at runtime and provide TypeScript types via `z.infer`.

(Previously: Defined Zod schemas for health response and pagination only)

#### Scenario: Invalid DTO fails validation

- GIVEN a Zod schema for a shared DTO requires `email` as email
- WHEN `schema.safeParse({ email: "bad" })` is called
- THEN the result is `success: false` with an issue on `email`

#### Scenario: Order creation schema validates

- GIVEN a Zod schema for order creation requires items, customer, delivery method
- WHEN `schema.safeParse({})` is called
- THEN the result is `success: false` with issues on required fields

## ADDED Requirements

### Requirement: Order Status Enums

The system SHALL export `OrderStatus` enum with values: `NUEVO`, `CONFIRMADO`, `EN_PREPARACION`, `LISTO`, `EN_CAMINO`, `ENTREGADO`, `CANCELADO`. Enum SHALL be usable both as TypeScript type and runtime value.

#### Scenario: OrderStatus used in type annotations

- GIVEN `OrderStatus` is imported from `@maison-fraise/shared`
- WHEN used as a type for a variable
- THEN TypeScript accepts valid status values

#### Scenario: OrderStatus used at runtime

- GIVEN `OrderStatus.NUEVO` is imported
- WHEN compared to a string value
- THEN it matches `"NUEVO"`

### Requirement: Payment Status Enums

The system SHALL export `PaymentStatus` enum with values: `PENDIENTE`, `VERIFICANDO`, `CONFIRMADO`, `RECHAZADO`, `NO_APLICA`. Enum SHALL be usable both as TypeScript type and runtime value.

#### Scenario: PaymentStatus runtime usage

- GIVEN `PaymentStatus` is imported from `@maison-fraise/shared`
- WHEN `PaymentStatus.PENDIENTE` is used in a comparison
- THEN it evaluates correctly

### Requirement: Payment Method Enums

The system SHALL export `PaymentMethod` enum with values: `EFECTIVO`, `NEQUI`, `DAVIPLATA`, `LLAVE_BRE_B`. Enum SHALL be usable both as TypeScript type and runtime value.

#### Scenario: PaymentMethod in form logic

- GIVEN `PaymentMethod` is imported from `@maison-fraise/shared`
- WHEN used in a switch statement for payment UI
- THEN all four methods are handled

### Requirement: Order Origin Enums

The system SHALL export `OrderOrigin` enum with values: `ONLINE`, `DIRECT`. Enum SHALL be usable both as TypeScript type and runtime value.

#### Scenario: OrderOrigin default handling

- GIVEN `OrderOrigin` is imported from `@maison-fraise/shared`
- WHEN used as default value for order origin
- THEN `OrderOrigin.ONLINE` is the default

### Requirement: Order DTOs

The system SHALL export TypeScript DTOs: `CreateOrderDto`, `UpdateOrderStatusDto`, `UpdatePaymentStatusDto`, `OrderResponseDto`, `OrderItemDto`, `OrderItemToppingDto`, `CustomerDto`. DTOs SHALL use Zod schemas for validation and `z.infer` for type generation.

#### Scenario: CreateOrderDto validates correct shape

- GIVEN `CreateOrderDto` schema from `@maison-fraise/shared`
- WHEN valid order payload is parsed
- THEN `success: true` with typed output

#### Scenario: CreateOrderDto rejects invalid shape

- GIVEN `CreateOrderDto` schema from `@maison-fraise/shared`
- WHEN payload missing required `items` is parsed
- THEN `success: false` with error on `items`

### Requirement: Pricing Helpers

The system SHALL export `calculateOrderTotal(items: OrderItemDto[]): number` helper that sums item totals (priceAtOrder * quantity + toppings) for display purposes. Helper SHALL NOT be used for price determination — snapshot values are authoritative.

#### Scenario: Total calculation

- GIVEN items with priceAtOrder 25000 qty 1 and priceAtOrder 30000 qty 2
- WHEN `calculateOrderTotal` is called
- THEN result is 85000

## Non-goals

- Domain entities (Prisma models stay in api); business logic; UI components; authentication DTOs.

## Dependencies

- `monorepo-workspace` (tsconfig, pnpm). No runtime services.

## Success Criteria

- `packages/shared` exports all order enums, DTOs, and Zod schemas; both apps import successfully; `pnpm build` passes; at least one Zod schema with inferred type; no duplicated DTO definitions across apps.
