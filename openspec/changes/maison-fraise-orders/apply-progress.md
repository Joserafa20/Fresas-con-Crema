# Apply Progress: maison-fraise-orders — PR1

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

## Work Unit Evidence

| Evidence | Value |
|----------|-------|
| Focused test command | `pnpm --filter shared test && pnpm --filter api test` — 50/50 pass |
| Runtime harness | NestJS app boots, OrderModule registers; `POST /api/v1/orders` endpoint available |
| Rollback boundary | `git revert` of all changes in this PR (schema migration + shared/order/* + apps/api/src/orders/*) |

## Commit

feat(orders-api): OrderModule with state machine, price snapshot, and business hours guard (PR1)

## Files Changed Summary

| File | Action |
|------|--------|
| `prisma/schema.prisma` | Modified — 6 models + 4 enums |
| `prisma/migrations/20260901151048_add_order_domain/` | Created |
| `packages/shared/src/order/enums.ts` | Created |
| `packages/shared/src/order/schemas.ts` | Created |
| `packages/shared/src/order/pricing.ts` | Created |
| `packages/shared/src/order/order-code.ts` | Created |
| `packages/shared/src/order/index.ts` | Created |
| `packages/shared/src/index.ts` | Modified |
| `apps/api/src/orders/domain/order.types.ts` | Created |
| `apps/api/src/orders/ports/order.repository.ts` | Created |
| `apps/api/src/orders/ports/customer.repository.ts` | Created |
| `apps/api/src/orders/application/order.service.ts` | Created |
| `apps/api/src/orders/infra/prisma-order.repository.ts` | Created |
| `apps/api/src/orders/infra/prisma-customer.repository.ts` | Created |
| `apps/api/src/orders/guards/business-hours.guard.ts` | Created |
| `apps/api/src/orders/presentation/order.controller.ts` | Created |
| `apps/api/src/orders/order.module.ts` | Created |
| `apps/api/src/app.module.ts` | Modified |
| `apps/api/src/config/env.schema.ts` | Modified |
| `packages/shared/src/order/order-code.test.ts` | Created |
| `packages/shared/src/order/pricing.test.ts` | Created |
| `packages/shared/src/order/schemas.test.ts` | Created |
| `apps/api/src/orders/order.types.test.ts` | Created |
| `apps/api/src/orders/domain/order.types.constants.test.ts` | Created |

## Risks

1. **Prisma generate EPERM**: Windows file locking during `prisma generate`. Resolved by killing node processes. May recur in CI — add retry logic.
2. **Business hours guard**: Config-optional — if env vars not set, guard is permissive (always allows). This is intentional for dev flexibility.
3. **Customer upsert by phone**: If two orders arrive simultaneously with same phone, upsert handles it. No race condition due to unique constraint.
4. **Order code collision**: Daily sequence via `countTodayOrders()` — under extreme concurrent load, two orders could get the same code. Low risk for MVP; add unique constraint check with retry for production.

## Remaining Tasks (PR2)

- [ ] Phase 4: Client Checkout Web
- [ ] Phase 5: Admin Order Dashboard
- [ ] Phase 6: Client Tracking
- [ ] Phase 7: Notifications Polling Integration
- [ ] Phase 8: Integration Verification
