# Order API Specification

## Purpose

NestJS order module exposing REST endpoints for order lifecycle management: create, list, get by code, update status, verify payment. Admin endpoints for review and confirmation. Thin HTTP adapter; business logic in service layer.

## Overview

`apps/api/src/orders/` module with controller, service, DTOs, entities. Hexagonal boundaries: service contains domain logic, controller is thin HTTP adapter. Validation via class-validator + Zod from shared-kernel.

## Requirements

### Requirement: Create Order Endpoint

The system SHALL expose `POST /api/v1/orders` accepting order payload (items with product/variant/topping IDs, quantities, customer data, delivery method, payment method). The endpoint SHALL validate all fields, snapshot prices, generate order code, and return the created order with code.

#### Scenario: Successful order creation

- GIVEN valid order payload with product, variant, toppings, customer name+phone, pickup delivery, cash payment
- WHEN `POST /api/v1/orders` is called
- THEN response is 201 with order code, status `NUEVO`, snapshotted prices, and payment status `NO APLICA`

#### Scenario: Validation error on missing customer

- GIVEN order payload without customer name
- WHEN `POST /api/v1/orders` is called
- THEN response is 400 with validation error on `customer.name`

#### Scenario: Business hours rejection

- GIVEN current time is outside configured business hours
- WHEN `POST /api/v1/orders` is called
- THEN response is 400 with "orders not accepted outside business hours"

#### Scenario: Price mismatch rejection

- GIVEN client sends price 20000 but catalog price is 25000
- WHEN `POST /api/v1/orders` is called
- THEN response is 400 with price mismatch error

### Requirement: List Orders Endpoint

The system SHALL expose `GET /api/v1/orders` returning a paginated list of orders with status filter. Admin can filter by status (`NUEVO`, `CONFIRMADO`, etc.), origin (`ONLINE`, `DIRECT`), and date range. Response SHALL include order code, status, customer name, total, and creation timestamp.

#### Scenario: List all orders

- GIVEN 5 orders exist with mixed statuses
- WHEN `GET /api/v1/orders` is called
- THEN response is 200 with 5 orders and pagination metadata

#### Scenario: Filter by status

- GIVEN 3 `NUEVO` orders and 2 `CONFIRMADO` orders
- WHEN `GET /api/v1/orders?status=NUEVO` is called
- THEN response contains only the 3 `NUEVO` orders

#### Scenario: Empty result

- GIVEN no orders match the filter
- WHEN `GET /api/v1/orders?status=CANCELADO` is called
- THEN response is 200 with empty list and `total: 0`

### Requirement: Get Order by Code

The system SHALL expose `GET /api/v1/orders/:code` returning full order detail including items, toppings, customer data, payment status, status history, and origin.

#### Scenario: Order found

- GIVEN order `MF-260901-001` exists
- WHEN `GET /api/v1/orders/MF-260901-001` is called
- THEN response is 200 with full order detail including items, toppings, customer, payment, and history

#### Scenario: Order not found

- GIVEN no order with code `MF-260901-999`
- WHEN `GET /api/v1/orders/MF-260901-999` is called
- THEN response is 404 with "order not found"

### Requirement: Update Order Status

The system SHALL expose `PATCH /api/v1/orders/:code/status` accepting `status` and optional `note`. The endpoint SHALL validate the transition against the state machine, create a history record, and return updated order.

#### Scenario: Valid status transition

- GIVEN order is in `NUEVO`
- WHEN `PATCH /api/v1/orders/MF-260901-001/status` with `{ status: "CONFIRMADO" }`
- THEN order status becomes `CONFIRMADO` and history record is created

#### Scenario: Invalid transition rejected

- GIVEN order is in `ENTREGADO`
- WHEN `PATCH /api/v1/orders/MF-260901-001/status` with `{ status: "NUEVO" }`
- THEN response is 400 with "invalid transition" error

#### Scenario: Status not found

- GIVEN no order with the given code
- WHEN status update is attempted
- THEN response is 404

### Requirement: Verify Payment

The system SHALL expose `PATCH /api/v1/orders/:code/payment` accepting `paymentStatus` and optional `note`. Only `PENDIENTE → VERIFICANDO → CONFIRMADO/RECHAZADO` transitions are allowed. `NO APLICA` payments SHALL NOT be modifiable.

#### Scenario: Confirm digital payment

- GIVEN order has `Nequi` payment with status `VERIFICANDO`
- WHEN `PATCH /api/v1/orders/MF-260901-001/payment` with `{ paymentStatus: "CONFIRMADO" }`
- THEN payment status becomes `CONFIRMADO`

#### Scenario: Reject payment

- GIVEN order has `Daviplata` payment with status `VERIFICANDO`
- WHEN `PATCH /api/v1/orders/MF-260901-001/payment` with `{ paymentStatus: "RECHAZADO", note: "proof invalid" }`
- THEN payment status becomes `RECHAZADO` and note is stored

#### Scenario: Cash payment not modifiable

- GIVEN order has `EFECTIVO` payment with status `NO APLICA`
- WHEN payment update is attempted
- THEN response is 400 with "cash payment not modifiable"

### Requirement: Admin Review Endpoint

The system SHALL expose `GET /api/v1/orders/pending` returning orders in `NUEVO` status sorted by creation time ascending, for admin review queue.

#### Scenario: Pending orders returned

- GIVEN 3 orders in `NUEVO` and 2 in `CONFIRMADO`
- WHEN `GET /api/v1/orders/pending` is called
- THEN response contains only the 3 `NUEVO` orders sorted oldest-first

#### Scenario: No pending orders

- GIVEN no orders in `NUEVO` status
- WHEN `GET /api/v1/orders/pending` is called
- THEN response is 200 with empty list

### Requirement: Order Origin Tracking

The system SHALL accept `origin` field (`ONLINE` or `DIRECT`) on order creation. If not provided, it SHALL default to `ONLINE`.

#### Scenario: Online order default

- GIVEN order payload without `origin`
- WHEN order is created
- THEN origin defaults to `ONLINE`

#### Scenario: Direct sale origin

- GIVEN order payload with `{ origin: "DIRECT" }`
- WHEN order is created
- THEN origin is `DIRECT`

## Non-goals

- PDF receipt generation; real-time push notifications; client authentication; delivery routing; inventory management.

## Dependencies

- `order-domain` (models, state machines, price snapshot); `shared-kernel` (DTOs, enums); `api-skeleton` (NestJS, ValidationPipe).

## Success Criteria

- All 7 endpoints return correct status codes; validation rejects invalid payloads; status transitions enforced; payment verification flow works; `pnpm build` and `pnpm test` pass.
