# Design: maison-fraise-orders

## Technical Approach

Order lifecycle via hexagonal `OrderModule` in `apps/api`. Prisma 6 models with 4 enums (`OrderStatus`, `PaymentStatus`, `PaymentMethod`, `OrderOrigin`). Price snapshot at creation from catalog DB. Order code `MF-YYMMDD-NNN` with daily sequence. Customer upsert by phone. Business hours gate from env config. Two state machines enforced in service layer. Next.js: multi-step checkout `/pedidos`, tracking `/pedidos/seguimiento/[code]`, admin dashboard `/admin/orders` with 30s polling + Web Audio alert. Shared kernel exports enums + Zod DTOs.

```
apps/api ─ OrderModule (hex) ─ Prisma ─ pg:16 ─┐
  ├─ domain/     (entities, state machine rules)
  ├─ application/ (OrderService orchestration)
  ├─ infra/      (Prisma repos, business hours check)
  └─ presentation/ (controller, guards, pipes)
apps/web ─ /pedidos (checkout) + /pedidos/seguimiento/[code] + /admin/orders
packages/shared ─ OrderStatus, PaymentStatus, PaymentMethod, OrderOrigin + Zod DTOs
```

## Architecture Decisions

| Decision | Chosen | Rejected | Rationale |
|----------|--------|----------|-----------|
| State machine | **Service-layer transition map** | DB constraint / XState | Follows catalog pattern; Prisma enums valid values only, service enforces transitions |
| Customer | **Upsert by phone, denormalize into Order** | FK reference only | Historical accuracy; same phone = same customer across orders, no auth needed |
| Order code | **Server-generated `MF-YYMMDD-NNN`** | UUID / user-chosen | Human-readable tracking; daily sequence via DB count query |
| Price snapshot | **Copy variant + topping prices into OrderItem/OrderItemTopping** | FK to catalog | Catalog prices change; orders must be immutable historical records |
| Polling | **30s admin, 15s client** | WebSocket / SSE | Zero-cost, PWA-compatible, deferred push for later phase |
| Sound alert | **Web Audio API oscillator** | Audio element / Howler | No asset dependency; short beep synthesized at runtime |
| Payment auto | **EFECTIVO → NO_APLICA auto-set** | Manual admin step | Cash needs no verification; reduces admin friction |
| Validation | **Zod shared + ZodValidationPipe** | class-validator only | Follows catalog pattern; isomorphic schemas |

## Data Flow — Order Creation

```
Client POST /api/v1/orders
  → JwtAuthGuard (optional: admin origin) → ZodValidationPipe(createOrderSchema)
  → OrderService.createOrder(dto)
    → BusinessHoursGuard: check NOW() within config range
    → CatalogRepo.findById(dto.items[].productId) — verify active, snapshot prices
    → CustomerRepo.upsertByPhone(dto.customer) — create or reuse
    → generateOrderCode(): count today's orders + 1 → MF-YYMMDD-NNN
    → Prisma Tx: Order + OrderItems + OrderItemToppings + Payment + OrderStatusHistory(NUEVO)
  → 201 { code, status, total }
```

## State Machine — Order Status

```
                    ┌──────────────┐
                    │    NUEVO     │ ← initial
                    └──────┬───────┘
                           │ confirm
                    ┌──────▼───────┐
                    │  CONFIRMADO  │
                    └──────┬───────┘
                           │ start prep
                    ┌──────▼───────┐
                    │EN PREPARACIÓN│
                    └──────┬───────┘
                           │ ready
                    ┌──────▼───────┐
                    │    LISTO     │
                    └──────┬───────┘
                           │ dispatch
                    ┌──────▼───────┐
                    │  EN CAMINO   │
                    └──────┬───────┘
                           │ deliver
                    ┌──────▼───────┐
                    │  ENTREGADO   │ ← terminal
                    └──────────────┘

  CANCELADO ← reachable from NUEVO, CONFIRMADO, EN PREPARACIÓN, LISTO
  Terminal states: ENTREGADO, CANCELADO (no further transitions)
```

Valid transitions map (service-layer guard):

```ts
const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NUEVO:           ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO:      ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION:  ['LISTO', 'CANCELADO'],
  LISTO:           ['EN_CAMINO', 'CANCELADO'],
  EN_CAMINO:       ['ENTREGADO'],
  ENTREGADO:       [],
  CANCELADO:       [],
};
```

## State Machine — Payment Status

```
  PENDIENTE → VERIFICANDO → CONFIRMADO (terminal)
                        └→ RECHAZADO (terminal)
  NO APLICA (terminal, auto-set for EFECTIVO)
```

## Prisma Schema — New Models

```prisma
enum OrderStatus { NUEVO CONFIRMADO EN_PREPARACION LISTO EN_CAMINO ENTREGADO CANCELADO }
enum PaymentStatus { PENDIENTE VERIFICANDO CONFIRMADO RECHAZADO NO_APLICA }
enum PaymentMethod { EFECTIVO NEQUI DAVIPLATA LLAVE_BRE_B }
enum OrderOrigin { ONLINE DIRECT }

model Customer {
  id        String   @id @default(cuid())
  name      String
  phone     String   @unique
  createdAt DateTime @default(now())
  orders    Order[]
}

model Order {
  id              String              @id @default(cuid())
  code            String              @unique
  status          OrderStatus         @default(NUEVO)
  origin          OrderOrigin         @default(ONLINE)
  deliveryMethod  String              // "pickup" | "delivery"
  customerName    String              // denormalized snapshot
  customerPhone   String
  address         String?
  barrio          String?
  reference       String?
  notes           String?
  totalCents      Int
  customerId      String
  customer        Customer            @relation(fields: [customerId], references: [id])
  items           OrderItem[]
  payment         Payment?
  statusHistory   OrderStatusHistory[]
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  @@index([status])
  @@index([createdAt])
}

model OrderItem {
  id            String             @id @default(cuid())
  orderId       String
  productId     String
  variantId     String
  productName   String             // snapshot
  variantName   String             // snapshot
  priceAtOrder  Int                // snapshot: variant + toppings sum
  quantity      Int
  order         Order              @relation(fields: [orderId], references: [id], onDelete: Cascade)
  toppings      OrderItemTopping[]

  @@index([orderId])
}

model OrderItemTopping {
  id             String    @id @default(cuid())
  orderItemId    String
  toppingId      String
  toppingName    String    // snapshot
  priceAtOrder   Int       // snapshot
  orderItem      OrderItem @relation(fields: [orderItemId], references: [id], onDelete: Cascade)

  @@index([orderItemId])
}

model Payment {
  id            String        @id @default(cuid())
  orderId       String        @unique
  method        PaymentMethod
  status        PaymentStatus @default(PENDIENTE)
  note          String?
  order         Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model OrderStatusHistory {
  id          String      @id @default(cuid())
  orderId     String
  fromStatus  OrderStatus
  toStatus    OrderStatus
  note        String?
  createdAt   DateTime    @default(now())
  order       Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId, createdAt])
}
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modify | 6 new models + 4 enums |
| `packages/shared/src/order/enums.ts` | Create | OrderStatus, PaymentStatus, PaymentMethod, OrderOrigin Zod enums |
| `packages/shared/src/order/dto.ts` | Create | CreateOrderSchema, UpdateStatusSchema, UpdatePaymentSchema, OrderResponseSchema |
| `packages/shared/src/order/pricing.ts` | Create | calculateOrderTotal helper |
| `packages/shared/src/order/index.ts` | Create | barrel export |
| `packages/shared/src/index.ts` | Modify | add `export * from "./order/index.js"` |
| `apps/api/src/orders/order.module.ts` | Create | hexagonal module wiring |
| `apps/api/src/orders/domain/order.types.ts` | Create | transition map, code format, business hours types |
| `apps/api/src/orders/application/order.service.ts` | Create | createOrder, listOrders, getByCode, updateStatus, updatePayment |
| `apps/api/src/orders/ports/order.repository.ts` | Create | OrderRepository interface + symbol |
| `apps/api/src/orders/ports/customer.repository.ts` | Create | CustomerRepository interface + symbol |
| `apps/api/src/orders/infra/prisma-order.repository.ts` | Create | Prisma implementation |
| `apps/api/src/orders/infra/prisma-customer.repository.ts` | Create | Upsert by phone |
| `apps/api/src/orders/presentation/order.controller.ts` | Create | REST endpoints |
| `apps/api/src/orders/guards/business-hours.guard.ts` | Create | Config-driven hours check |
| `apps/api/src/app.module.ts` | Modify | import OrderModule |
| `apps/api/src/config/env.schema.ts` | Modify | add BUSINESS_HOURS_START, BUSINESS_HOURS_END |
| `apps/web/app/pedidos/page.tsx` | Create | Multi-step checkout form |
| `apps/web/app/pedidos/seguimiento/[code]/page.tsx` | Create | Client tracking with 15s polling |
| `apps/web/components/orders/checkout/*` | Create | ProductPicker, CustomerForm, PaymentForm, OrderSummary |
| `apps/web/components/orders/tracking/*` | Create | StatusTimeline, PollingProvider |
| `apps/web/app/admin/orders/page.tsx` | Create | Order list with 30s polling + badge |
| `apps/web/app/admin/orders/[code]/page.tsx` | Create | Order detail with action buttons |
| `apps/web/components/orders/admin/*` | Create | OrderRow, StatusActions, PaymentActions, SoundAlert |
| `apps/web/public/sounds/order-alert.mp3` | Create | Default alert sound |

## Interfaces / Contracts

```ts
// packages/shared/src/order/enums.ts
export const OrderStatusSchema = z.enum([
  'NUEVO','CONFIRMADO','EN_PREPARACION','LISTO','EN_CAMINO','ENTREGADO','CANCELADO'
]);
export const PaymentStatusSchema = z.enum(['PENDIENTE','VERIFICANDO','CONFIRMADO','RECHAZADO','NO_APLICA']);
export const PaymentMethodSchema = z.enum(['EFECTIVO','NEQUI','DAVIPLATA','LLAVE_BRE_B']);
export const OrderOriginSchema = z.enum(['ONLINE','DIRECT']);

// packages/shared/src/order/dto.ts
export const CreateOrderItemSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid(),
  quantity: z.number().int().min(1),
  toppingIds: z.array(z.string().cuid()).optional().default([]),
  clientPriceCents: z.number().int().min(0), // must match server snapshot
});
export const CreateOrderSchema = z.object({
  items: z.array(CreateOrderItemSchema).min(1),
  customer: z.object({
    name: z.string().min(2),
    phone: z.string().min(10),
    address: z.string().optional(),
    barrio: z.string().optional(),
    reference: z.string().optional(),
    notes: z.string().optional(),
  }),
  deliveryMethod: z.enum(['pickup', 'delivery']),
  paymentMethod: PaymentMethodSchema,
  origin: OrderOriginSchema.optional().default('ONLINE'),
});

// Order code format
type OrderCode = `MF-${string}-${string}`; // MF-YYMMDD-NNN
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | State machine transitions, price snapshot calc, code generation, business hours | Vitest pure functions |
| Integration | Order CRUD, status transitions, payment flow, customer upsert, price mismatch rejection | Supertest + Prisma test DB |
| E2E | Checkout flow, tracking page, admin list/detail, polling + sound | Playwright |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

Additive only: 6 new tables + 4 enums. Rollback via `git revert`. Prisma migration is additive (no alter/drop). Seed optional: no seed data for orders (user-generated). Feature flags: business hours config via env. No phased rollout needed.

## Open Questions

- [ ] Should EFECTIVO orders skip NUEVO and go straight to CONFIRMADO? (proposal Q2 — assume no for now, all enter review)
- [ ] Max items per order? (proposal Q3 — assume no limit for MVP)
- [ ] Admin can add/edit toppings post-creation? (proposal Q4 — assume no, order immutable after placement)
- [ ] Tracking page: live status tracker vs "we'll contact you"? (proposal Q1 — assume tracker per spec)
