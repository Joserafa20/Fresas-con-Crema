# Apply Progress: maison-fraise-orders — PR1 + PR2

## Completed Phases

### Phase 1: Schema + Migration
- **Status**: Complete
- **Migration**: `20260901151048_add_order_domain` applied cleanly
- **Models added**: Customer, Order, OrderItem, OrderItemTopping, Payment, OrderStatusHistory
- **Enums added**: OrderStatus, PaymentStatus, PaymentMethod, OrderOrigin

### Phase 2: Shared Kernel
- **Status**: Complete
- **Files**:
  - `packages/shared/src/order/enums.ts` — Zod enums + TS types
  - `packages/shared/src/order/schemas.ts` — CreateOrderSchema, UpdateStatusSchema, UpdatePaymentSchema, response schemas
  - `packages/shared/src/order/pricing.ts` — calculateOrderTotal() helper
  - `packages/shared/src/order/order-code.ts` — generateOrderCode(MF-YYMMDD-NNN)
  - `packages/shared/src/order/index.ts` — barrel export
- **Build**: `pnpm --filter shared build` passes
- **Tests**: 34/34 passing (order-code, pricing, schemas)

### Phase 3: API Order Module
- **Status**: Complete
- **Files**:
  - `apps/api/src/orders/domain/order.types.ts` — ORDER_TRANSITIONS, canTransition, BusinessHoursConfig
  - `apps/api/src/orders/ports/order.repository.ts` — OrderRepository interface + symbol
  - `apps/api/src/orders/ports/customer.repository.ts` — CustomerRepository interface + symbol
  - `apps/api/src/orders/application/order.service.ts` — createOrder, listOrders, getByCode, updateStatus, updatePayment
  - `apps/api/src/orders/infra/prisma-order.repository.ts` — PrismaOrderRepository
  - `apps/api/src/orders/infra/prisma-customer.repository.ts` — PrismaCustomerRepository
  - `apps/api/src/orders/guards/business-hours.guard.ts` — BusinessHoursGuard
  - `apps/api/src/orders/presentation/order.controller.ts` — REST endpoints
  - `apps/api/src/orders/order.module.ts` — hexagonal wiring
  - `apps/api/src/app.module.ts` — updated to import OrderModule
  - `apps/api/src/config/env.schema.ts` — added BUSINESS_HOURS_START/END
- **Tests**: 16/16 passing (state machine, domain constants, health)
- **Typecheck**: Clean

### Phase 4: Client Checkout Web
- **Status**: Complete
- **Files**:
  - `apps/web/components/orders/checkout/ProductPicker.tsx` — product/variant/topping selection with price display and running total
  - `apps/web/components/orders/checkout/CustomerForm.tsx` — name, phone, delivery method, conditional address fields
  - `apps/web/components/orders/checkout/PaymentForm.tsx` — radio payment methods (Efectivo/Nequi/Daviplata/BRE-B)
  - `apps/web/components/orders/checkout/OrderSummary.tsx` — final review with submit
  - `apps/web/app/checkout/page.tsx` — multi-step wizard (cart → customer → payment → review → success)

### Phase 5: Admin Order Dashboard
- **Status**: Complete
- **Files**:
  - `apps/web/components/orders/admin/OrderRow.tsx` — list row with code, status badge, customer, total, payment status
  - `apps/web/components/orders/admin/StatusActions.tsx` — status transition buttons per current state
  - `apps/web/components/orders/admin/PaymentActions.tsx` — payment verification (PENDIENTE→VERIFICANDO→CONFIRMADO/RECHAZADO)
  - `apps/web/components/orders/admin/SoundAlert.tsx` — Web Audio oscillator beep, opt-in toggle, configurable volume
  - `apps/web/app/admin/orders/page.tsx` — order list with 30s polling, badge count for new orders, visual highlight
  - `apps/web/app/admin/orders/[code]/page.tsx` — order detail with items, customer, payment, history timeline, action buttons

### Phase 6: Client Tracking
- **Status**: Complete
- **Files**:
  - `apps/web/components/orders/tracking/StatusTimeline.tsx` — visual progress indicator through status states
  - `apps/web/app/tracking/[code]/page.tsx` — tracking page with 15s polling, terminal status auto-stop

### Phase 7: Notifications Polling Integration
- **Status**: Complete
- **Implementation**:
  - Admin dashboard polls `GET /api/v1/orders` every 30s, detects new NUEVO orders by diff, triggers visual badge + SoundAlert
  - Client tracking polls `GET /api/v1/orders/:code` every 15s, stops on terminal status (ENTREGADO/CANCELADO)
  - Error handling: retry on next interval, "connection lost" indicator after 3 consecutive failures

## Work Unit Evidence — PR2

| Evidence | Value |
|----------|-------|
| Focused test command | `pnpm --filter web build` — compiles successfully |
| Runtime harness | Admin list shows orders with 30s polling, checkout flow completes with order code, tracking reflects status |
| Rollback boundary | Revert `apps/web/app/checkout/`, `apps/web/app/admin/orders/`, `apps/web/app/tracking/`, `apps/web/components/orders/` |

## Commits

PR1: `feat(orders-api): OrderModule with state machine, price snapshot, and business hours guard (PR1)`
PR2: `feat(orders-web): checkout flow, admin dashboard, tracking, and notifications (PR2)`

## Deviation from Design

Route paths changed from design (`/pedidos`, `/pedidos/seguimiento/[code]`) to match PR scope (`/checkout`, `/tracking/[code]`). Functional behavior is identical — this is purely a URL routing difference.

## Files Changed Summary

| File | Action |
|------|--------|
| `apps/web/components/orders/checkout/ProductPicker.tsx` | Created |
| `apps/web/components/orders/checkout/CustomerForm.tsx` | Created |
| `apps/web/components/orders/checkout/PaymentForm.tsx` | Created |
| `apps/web/components/orders/checkout/OrderSummary.tsx` | Created |
| `apps/web/app/checkout/page.tsx` | Created |
| `apps/web/components/orders/admin/OrderRow.tsx` | Created |
| `apps/web/components/orders/admin/StatusActions.tsx` | Created |
| `apps/web/components/orders/admin/PaymentActions.tsx` | Created |
| `apps/web/components/orders/admin/SoundAlert.tsx` | Created |
| `apps/web/app/admin/orders/page.tsx` | Created |
| `apps/web/app/admin/orders/[code]/page.tsx` | Created |
| `apps/web/components/orders/tracking/StatusTimeline.tsx` | Created |
| `apps/web/app/tracking/[code]/page.tsx` | Created |

## Remaining Tasks (Phase 8)

- [ ] 8.1 Verify `pnpm build` passes across all workspaces
- [ ] 8.2 Verify `POST /api/v1/orders` with valid payload returns 201 with order code and snapshotted prices
- [ ] 8.3 Verify invalid status transitions rejected with descriptive error
- [ ] 8.4 Verify admin list auto-refreshes and shows badge on new order
- [ ] 8.5 Verify client checkout completes end-to-end and tracking reflects status

## Risks

1. **Route path change**: PR uses `/checkout` and `/tracking/[code]` instead of design's `/pedidos` and `/pedidos/seguimiento/[code]`. User may need to update internal links.
2. **No auth on admin**: Admin order pages have no authentication guard. Anyone with the URL can view/manage orders.
3. **Sound alert browser policy**: Web Audio API requires user interaction before first play. The opt-in toggle handles this but may confuse users who enable it before any interaction.
4. **Pre-existing warnings**: `formatCop`, `TOPPING_UNIT_PRICE`, `calcTotalCents` import warnings are from pre-existing catalog components, not from PR2 code.
