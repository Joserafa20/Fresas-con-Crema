# Tasks: maison-fraise-orders

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 400–450 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (schema + shared + API domain) → PR 2 (web checkout + admin + tracking + notifications) |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Schema + shared kernel + API order module (hexagonal domain, state machines, price snapshot, controller, business hours) | PR 1 | `pnpm --filter api test && pnpm --filter shared build` | NestJS app boots, `POST /api/v1/orders` returns 201; `GET /api/v1/orders` lists | Revert entire `apps/api/src/orders/` + `packages/shared/src/order/` + prisma migration |
| 2 | Client checkout, admin dashboard, tracking, notifications | PR 2 | `pnpm --filter web build` | Admin list shows polls, checkout flow completes, tracking reflects status | Revert `apps/web/app/pedidos/`, `apps/web/app/admin/orders/`, `apps/web/components/orders/` |

## Phase 1: Schema + Migration

- [x] 1.1 Add 4 enums to `apps/api/prisma/schema.prisma`: `OrderStatus`, `PaymentStatus`, `PaymentMethod`, `OrderOrigin`
- [x] 1.2 Add 6 models to `schema.prisma`: `Customer`, `Order`, `OrderItem`, `OrderItemTopping`, `Payment`, `OrderStatusHistory` with relations and `@@index`
- [x] 1.3 Run `npx prisma migrate dev --name add-order-domain` and verify migration applies cleanly

## Phase 2: Shared Kernel

- [x] 2.1 Create `packages/shared/src/order/enums.ts` — Zod enums for `OrderStatus`, `PaymentStatus`, `PaymentMethod`, `OrderOrigin` with TS type exports
- [x] 2.2 Create `packages/shared/src/order/schemas.ts` — `CreateOrderSchema`, `UpdateStatusSchema`, `UpdatePaymentSchema`, `OrderResponseSchema` Zod schemas with `z.infer` types
- [x] 2.3 Create `packages/shared/src/order/pricing.ts` — `calculateOrderTotal()` helper
- [x] 2.4 Create `packages/shared/src/order/index.ts` barrel; update `packages/shared/src/index.ts` to re-export order module
- [x] 2.5 Verify: `pnpm --filter shared build` passes

## Phase 3: API Order Module — Domain Layer

- [x] 3.1 Create `apps/api/src/orders/domain/order.types.ts` — `ORDER_TRANSITIONS` map, `OrderCode` format type, `BusinessHoursConfig` interface
- [x] 3.2 Create `apps/api/src/orders/ports/order.repository.ts` — `OrderRepository` interface + injection symbol
- [x] 3.3 Create `apps/api/src/orders/ports/customer.repository.ts` — `CustomerRepository` interface + injection symbol
- [x] 3.4 Create `apps/api/src/orders/application/order.service.ts` — `createOrder` (price snapshot + code gen + customer upsert + Prisma tx), `listOrders` (status/origin filter), `getByCode`, `updateStatus` (transition guard + history), `updatePayment` (payment state machine)
- [x] 3.5 Create `apps/api/src/orders/infra/prisma-order.repository.ts` — Prisma implementation of `OrderRepository`
- [x] 3.6 Create `apps/api/src/orders/infra/prisma-customer.repository.ts` — upsert-by-phone implementation
- [x] 3.7 Create `apps/api/src/orders/guards/business-hours.guard.ts` — `CanActivate` guard checking `NOW()` against env config
- [x] 3.8 Create `apps/api/src/orders/presentation/order.controller.ts` — REST endpoints: `POST /orders`, `GET /orders`, `GET /orders/pending`, `GET /orders/:code`, `PATCH /orders/:code/status`, `PATCH /orders/:code/payment`
- [x] 3.9 Create `apps/api/src/orders/order.module.ts` — hexagonal wiring (providers, controllers, module imports)
- [x] 3.10 Modify `apps/api/src/app.module.ts` to import `OrderModule`
- [x] 3.11 Modify `apps/api/src/config/env.schema.ts` to add `BUSINESS_HOURS_START`, `BUSINESS_HOURS_END`
- [x] 3.12 Test: `pnpm --filter api test` — unit tests for state machine transitions, price snapshot, code generation, business hours guard

## Phase 4: Client Checkout Web

- [x] 4.1 Create `apps/web/components/orders/checkout/ProductPicker.tsx` — product/variant/topping selection with price display and running total
- [x] 4.2 Create `apps/web/components/orders/checkout/CustomerForm.tsx` — name, phone, delivery method, conditional address fields
- [x] 4.3 Create `apps/web/components/orders/checkout/PaymentForm.tsx` — radio payment methods with digital confirmation
- [x] 4.4 Create `apps/web/components/orders/checkout/OrderSummary.tsx` — final review with submit
- [x] 4.5 Create `apps/web/app/checkout/page.tsx` — multi-step wizard orchestrating ProductPicker → CustomerForm → PaymentForm → OrderSummary → success page with order code

## Phase 5: Admin Order Dashboard

- [x] 5.1 Create `apps/web/components/orders/admin/OrderRow.tsx` — list row with code, status badge, customer, origin, total, payment status
- [x] 5.2 Create `apps/web/components/orders/admin/StatusActions.tsx` — status transition buttons (confirm, cancel, advance) per current state
- [x] 5.3 Create `apps/web/components/orders/admin/PaymentActions.tsx` — payment verification actions (PENDIENTE → VERIFICANDO → CONFIRMADO/RECHAZADO)
- [x] 5.4 Create `apps/web/components/orders/admin/SoundAlert.tsx` — Web Audio oscillator beep, opt-in toggle, configurable volume
- [x] 5.5 Create `apps/web/app/admin/orders/page.tsx` — order list with 30s polling, badge count for new orders, visual highlight
- [x] 5.6 Create `apps/web/app/admin/orders/[code]/page.tsx` — order detail with items, customer, payment, history timeline, action buttons

## Phase 6: Client Tracking

- [x] 6.1 Create `apps/web/components/orders/tracking/StatusTimeline.tsx` — visual progress indicator through status states
- [x] 6.2 Create `apps/web/app/tracking/[code]/page.tsx` — tracking page with 15s polling, terminal status auto-stop

## Phase 7: Notifications Polling Integration

- [x] 7.1 Wire admin dashboard 30s polling to `GET /api/v1/orders/pending`, detect new orders by diff, trigger visual badge + SoundAlert
- [x] 7.2 Wire client tracking 15s polling to `GET /api/v1/orders/:code`, stop on terminal status
- [x] 7.3 Implement polling error handling: retry on next interval, "connection lost" indicator after 3 consecutive failures

## Phase 8: Integration Verification

- [ ] 8.1 Verify `pnpm build` passes across all workspaces
- [ ] 8.2 Verify `POST /api/v1/orders` with valid payload returns 201 with order code and snapshotted prices
- [ ] 8.3 Verify invalid status transitions rejected with descriptive error
- [ ] 8.4 Verify admin list auto-refreshes and shows badge on new order
- [ ] 8.5 Verify client checkout completes end-to-end and tracking reflects status
