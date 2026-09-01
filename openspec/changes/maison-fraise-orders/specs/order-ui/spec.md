# Order UI Specification

## Purpose

Next.js client and admin interfaces for order lifecycle: client checkout flow (cart → data → payment → confirm → tracking), admin order management (list, detail, status updates, payment verification). Atomic Design components.

## Overview

Admin routes at `/admin/orders` (list + detail with alerts); client route at `/pedidos` (order form). Components follow Atomic Design: molecules for order items, organisms for order form, templates for admin layout.

## Requirements

### Requirement: Client Order Placement Flow

The system SHALL provide a multi-step checkout form at `/pedidos`: (1) product selection with variant/topping picker, (2) customer data (name, phone, delivery method, address if delivery), (3) payment method selection, (4) confirmation summary, (5) success page with order code and tracking reference.

#### Scenario: Complete checkout flow

- GIVEN a customer selects a product, variant, and toppings
- WHEN they complete all steps and submit
- THEN order is created, order code is displayed, and success page shows tracking reference

#### Scenario: Delivery requires address

- GIVEN customer selects "delivery" delivery method
- WHEN they proceed to step 2 without address
- THEN form validation prevents proceeding and highlights missing fields

#### Scenario: Pickup skips address

- GIVEN customer selects "pickup" delivery method
- WHEN they proceed to step 2
- THEN address, barrio, and reference fields are hidden

### Requirement: Product Selection with Price Display

The system SHALL display available products with variants and toppings as a selectable form. Prices SHALL be displayed per item, per variant, and per topping. Running total SHALL update in real-time as selections change.

#### Scenario: Price updates on selection

- GIVEN "Fresas con Crema" base price 25000, "Grande" variant +5000, "Nutella" topping +3000
- WHEN customer selects product, "Grande" variant, and "Nutella"
- THEN displayed total is 33000 COP

#### Scenario: Removing item updates total

- GIVEN customer has 2 items in cart totaling 60000 COP
- WHEN they remove one item worth 33000 COP
- THEN displayed total updates to 27000 COP

### Requirement: Customer Data Form

The system SHALL collect customer name (required, min 2 chars), phone (required, min 10 digits), delivery method (`pickup` or `delivery`), and conditionally: address (required if delivery), barrio (required if delivery), reference (optional), notes (optional).

#### Scenario: Minimal pickup order

- GIVEN customer enters name "Ana" and phone "3001234567"
- WHEN they select pickup delivery
- THEN form validates successfully without address fields

#### Scenario: Phone validation

- GIVEN customer enters phone "123"
- WHEN form is submitted
- THEN validation error shows "phone must be at least 10 digits"

### Requirement: Payment Method Selection

The system SHALL display available payment methods (Efectivo, Nequi, Daviplata, Llave BRE-B) as radio options. If a digital method is selected, the form SHALL display payment instructions and a confirmation checkbox.

#### Scenario: Cash payment

- GIVEN customer selects "Efectivo"
- WHEN they confirm
- THEN order is created with payment status `NO APLICA`

#### Scenario: Digital payment with confirmation

- GIVEN customer selects "Nequi"
- WHEN they confirm
- THEN order is created with payment status `PENDIENTE` and a "pending verification" message is shown

### Requirement: Order Confirmation Summary

The system SHALL display a final summary before submission showing: items with quantities and prices, customer data, delivery method, payment method, and total. A submit button SHALL require explicit confirmation.

#### Scenario: Summary accuracy

- GIVEN customer has items totaling 33000 COP with Nequi payment
- WHEN they reach the confirmation step
- THEN summary shows all items, prices, total, customer data, and "Nequi - pending verification"

### Requirement: Order Tracking Page

The system SHALL provide a tracking page at `/pedidos/seguimiento` where customers can enter their order code to view current status. The page SHALL poll for status updates at 15-second intervals.

#### Scenario: Track order by code

- GIVEN order `MF-260901-001` exists with status `EN PREPARACIÓN`
- WHEN customer enters code on tracking page
- THEN current status is displayed with progress indicator

#### Scenario: Invalid code

- GIVEN no order with code `MF-260901-999`
- WHEN customer enters code on tracking page
- THEN "order not found" message is displayed

#### Scenario: Status auto-refresh

- GIVEN customer is viewing tracking page for `MF-260901-001`
- WHEN order status changes server-side
- THEN tracking page updates status within 15 seconds without page refresh

### Requirement: Admin Order List Page

The system SHALL provide admin route `/admin/orders` displaying all orders with columns: code, status, customer name, origin, total, created at, payment status. Page SHALL auto-refresh every 30 seconds. New orders arriving during viewing SHALL trigger a visual indicator (badge count or highlight).

#### Scenario: Order list displays correctly

- GIVEN 5 orders with mixed statuses
- WHEN admin visits `/admin/orders`
- THEN all 5 orders are listed with correct status, customer, and payment info

#### Scenario: Auto-refresh on new order

- GIVEN admin is viewing order list with 3 orders
- WHEN a 4th order is created
- THEN within 30 seconds, the list refreshes and new order appears with visual highlight

### Requirement: Admin Order Detail Page

The system SHALL provide admin route `/admin/orders/:code` showing full order detail: items with prices, customer data, payment status, status history timeline, and action buttons (confirm, cancel, update status, verify payment).

#### Scenario: Admin confirms order

- GIVEN order `MF-260901-001` is in `NUEVO`
- WHEN admin clicks "Confirm" button
- THEN order status changes to `CONFIRMADO` and detail page refreshes

#### Scenario: Admin cancels order

- GIVEN order `MF-260901-001` is in `EN PREPARACIÓN`
- WHEN admin clicks "Cancel" and confirms
- THEN order status changes to `CANCELADO` with cancellation note

#### Scenario: Payment verification action

- GIVEN order has `Nequi` payment with status `PENDIENTE`
- WHEN admin marks payment as `VERIFICANDO` then `CONFIRMADO`
- THEN payment status updates and detail page reflects change

### Requirement: Admin Sound Alert on New Order

The system SHALL play a configurable sound alert when a new order arrives in the admin dashboard. Sound SHALL be opt-in (default off) and configurable in admin settings. Sound SHALL NOT play if admin has disabled it.

#### Scenario: Sound enabled and new order arrives

- GIVEN admin has enabled sound alerts
- WHEN a new order status `NUEVO` is detected via polling
- THEN sound alert plays and visual indicator appears

#### Scenario: Sound disabled

- GIVEN admin has disabled sound alerts
- WHEN a new order arrives
- THEN only visual indicator appears, no sound

### Requirement: Responsive Layout

All order UI pages SHALL be responsive and usable at 375px (mobile) and 1280px (desktop) widths. Admin pages SHALL use a sidebar navigation pattern. Client pages SHALL use a single-column layout.

#### Scenario: Mobile checkout

- GIVEN a customer visits `/pedidos` at 375px width
- WHEN they complete the checkout flow
- THEN all steps are usable with no horizontal overflow

#### Scenario: Desktop admin

- GIVEN admin visits `/admin/orders` at 1280px width
- WHEN they view the order list
- THEN sidebar navigation is visible alongside the content

## Non-goals

- PDF receipt generation; real-time push notifications; offline order queue; client authentication; image upload; delivery routing UI.

## Dependencies

- `order-api` (endpoints); `order-domain` (models, enums); `order-notifications` (polling, alerts); `shared-kernel` (DTOs, Zod schemas); `web-shell` (PWA shell, responsive base).

## Success Criteria

- Client checkout flow completes end-to-end; admin list shows real-time new order alerts; status updates reflected in admin detail; tracking page polls correctly; responsive at mobile/desktop; `pnpm build` passes.
