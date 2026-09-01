# Order Domain Specification

## Purpose

Core domain models and state machines for the order lifecycle: customer places order, admin reviews, payment verified, preparation tracked, delivery/collection coordinated. Prices frozen at creation time; every state transition logged.

## Overview

Defines Prisma schema for `Order`, `OrderItem`, `OrderItemTopping`, `Payment`, `Customer`, `OrderStatusHistory`; two state machines (order status + payment status); price snapshot logic; order code generation; and validation rules.

## Requirements

### Requirement: Order Status State Machine

The system SHALL enforce the following order status transitions: `NUEVO → CONFIRMADO → EN PREPARACIÓN → LISTO → EN CAMINO → ENTREGADO` with `CANCELADO` reachable from any non-terminal state (`NUEVO`, `CONFIRMADO`, `EN PREPARACIÓN`, `LISTO`). Terminal states (`ENTREGADO`, `CANCELADO`) SHALL NOT allow further transitions.

#### Scenario: Valid forward transition

- GIVEN an order is in state `NUEVO`
- WHEN admin confirms the order
- THEN status changes to `CONFIRMADO` and a history record is created with timestamp

#### Scenario: Cancel from non-terminal state

- GIVEN an order is in state `EN PREPARACIÓN`
- WHEN admin cancels the order
- THEN status changes to `CANCELADO` and a history record is created

#### Scenario: Reject transition from terminal state

- GIVEN an order is in state `ENTREGADO`
- WHEN admin attempts to change status
- THEN the system rejects the transition with a descriptive error and status remains `ENTREGADO`

#### Scenario: Skip states rejected

- GIVEN an order is in state `NUEVO`
- WHEN admin attempts to set status to `LISTO`
- THEN the system rejects the transition with an error indicating the valid next states

### Requirement: Payment Status State Machine

The system SHALL enforce payment status transitions: `PENDIENTE → VERIFICANDO → CONFIRMADO | RECHAZADO | NO APLICA`. `NO APLICA` is auto-set for `EFECTIVO` method. Digital methods (`Nequi`, `Daviplata`, `Llave BRE-B`) start at `PENDIENTE`.

#### Scenario: Cash payment auto-skip

- GIVEN an order with payment method `EFECTIVO`
- WHEN the order is created
- THEN payment status is automatically `NO APLICA`

#### Scenario: Digital payment verification flow

- GIVEN an order with payment method `Nequi`
- WHEN admin reviews payment proof
- THEN status transitions from `PENDIENTE` to `VERIFICANDO`, then to `CONFIRMADO` or `RECHAZADO`

#### Scenario: Reject from CONFIRMADO rejected

- GIVEN payment status is `CONFIRMADO`
- WHEN admin attempts to reject
- THEN the system rejects the transition

### Requirement: Price Snapshot at Order Creation

The system SHALL fetch current product, variant, and topping prices from the database at order creation time and store them in `OrderItem.priceAtOrder` and `OrderItemTopping.priceAtOrder`. Existing orders SHALL NEVER read prices from the live catalog.

#### Scenario: Snapshot frozen on creation

- GIVEN product "Fresas con Crema" costs 25000 COP, variant "Grande" adds 5000 COP, topping "Nutella" costs 3000 COP
- WHEN the customer places an order with this product, variant, and topping
- THEN `OrderItem.priceAtOrder` is 30000 COP and `OrderItemTopping.priceAtOrder` is 3000 COP

#### Scenario: Catalog price change does not affect existing orders

- GIVEN an order was created with product price 25000 COP
- WHEN the admin updates the product price to 30000 COP
- THEN the existing order still shows 25000 COP in `priceAtOrder`

### Requirement: Order Code Generation

The system SHALL generate a unique order code in format `MF-YYMMDD-NNN` (prefix + date + daily sequence). The code SHALL be immutable after creation and used as the primary tracking identifier.

#### Scenario: Code format on creation

- GIVEN the current date is 2026-09-01 and it is the first order of the day
- WHEN an order is created
- THEN the order code is `MF-260901-001`

#### Scenario: Code uniqueness

- GIVEN two orders are created on the same day
- WHEN both are persisted
- THEN each has a distinct sequence number (e.g., `MF-260901-001`, `MF-260901-002`)

#### Scenario: Code immutability

- GIVEN an order with code `MF-260901-001`
- WHEN any field is updated
- THEN the order code remains `MF-260901-001`

### Requirement: Customer Data Model

The system SHALL store customer data per order with minimum fields: `name` (required), `phone` (required). If order origin is delivery, `address`, `barrio`, and `reference` SHALL be required. Customer data is denormalized into Order for historical accuracy. No account or authentication is required.

#### Scenario: Pickup order minimal data

- GIVEN a customer places a pickup order
- WHEN name and phone are provided
- THEN the order is created without address fields

#### Scenario: Delivery order requires address

- GIVEN a customer places a delivery order
- WHEN address, barrio, or reference is missing
- THEN validation fails with descriptive error

### Requirement: Order Origin

The system SHALL distinguish order origin as `ONLINE` or `DIRECT` (in-person). Both origins enter the same status flow starting at `NUEVO`.

#### Scenario: Online order origin

- GIVEN a customer places an order via the web form
- WHEN the order is created
- THEN origin is `ONLINE`

#### Scenario: Direct sale origin

- GIVEN an admin creates an order in-person on behalf of a customer
- WHEN the order is created
- THEN origin is `DIRECT`

### Requirement: Status History Logging

The system SHALL log every order status transition with timestamp, previous status, new status, and optional note. History records SHALL be append-only.

#### Scenario: History on transition

- GIVEN an order transitions from `NUEVO` to `CONFIRMADO`
- WHEN the transition is saved
- THEN a history record exists with `fromStatus=NUEVO`, `toStatus=CONFIRMADO`, `timestamp`, and `note`

#### Scenario: History is append-only

- GIVEN an order has 3 status transitions
- WHEN history is queried
- THEN 3 records are returned in chronological order, none deleted or modified

### Requirement: Order Item Validation

The system SHALL validate at order creation: product is active, variant belongs to product, toppings are valid for the variant, quantity > 0, product/variant/topping prices match current catalog prices. Invalid data SHALL be rejected before order persistence.

#### Scenario: Active product validation

- GIVEN product "Fresas" has `isActive=false`
- WHEN a customer attempts to order it
- THEN validation fails with "product not available"

#### Scenario: Invalid topping for variant

- GIVEN variant "Grande" does not support topping "Miel"
- WHEN a customer includes this topping
- THEN validation fails with "topping not available for this variant"

#### Scenario: Price mismatch detection

- GIVEN catalog price is 25000 COP but client sends 20000 COP
- WHEN the order is submitted
- THEN the server rejects with price mismatch error and returns current catalog price

## Non-goals

- Inventory/stock management; delivery routing/assignment; PDF receipt generation; client authentication; image storage.

## Dependencies

- `persistence-foundation` (Prisma, PostgreSQL); `shared-kernel` (enums, DTOs).

## Success Criteria

- Prisma migration applies with all order domain models; order creation with price snapshot returns correct order code; invalid status transitions rejected with descriptive error; status history records created on every transition; `pnpm build` passes.
