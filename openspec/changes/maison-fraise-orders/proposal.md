# Proposal: maison-fraise-orders

## Intent

MAISON FRAISE currently has a scaffolded monorepo, API skeleton, web shell, and Prisma foundation but no domain logic. Orders are the core business transaction — without them, the system cannot accept sales, track preparation, manage payments, or coordinate delivery. This change introduces the full order lifecycle: client places order (online or direct), admin reviews and confirms, payment is verified, preparation tracks status, and delivery/collection is coordinated. Prices must be snapshotted at order time, every state transition logged, and admin alerted on new orders.

## Scope

### In Scope
- **Order domain model**: `Order`, `OrderItem`, `OrderItemTopping`, `Payment`, `OrderStatusHistory`
- **Customer model**: `Customer` (name, phone, address, barrio, reference, notes) — no account/auth required
- **Order status machine**: `NUEVO → CONFIRMADO → EN PREPARACIÓN → LISTO → EN CAMINO → ENTREGADO` + `CANCELADO` from any non-terminal state
- **Payment status machine**: `PENDIENTE → VERIFICANDO → CONFIRMADO / RECHAZADO / NO APLICA`
- **Payment methods**: Efectivo, Nequi, Daviplata, Llave BRE-B
- **Price snapshot**: Product + variant + topping prices frozen at order creation from DB
- **Admin review flow**: Visual + sound alert on new order; confirm/reject before confirmation
- **Validation**: Active product, valid variant, valid toppings, current price, valid quantity, delivery/pickup, client data, address if delivery, payment method, business hours
- **Order code**: Unique tracking number for client reference
- **State history**: Timestamped log of every status transition
- **Online vs direct sale**: Differentiation in order origin

### Out of Scope
- PDF receipt/comprobante generation (FASE 5)
- Real-time push notifications (PWA push API deferred — polling first)
- Client auth/accounts (name+phone minimum)
- Delivery assignment/routing optimization
- Inventory/stock management
- Image storage for products

## Capabilities

### New Capabilities
- `order-domain`: Prisma schema for Order, OrderItem, OrderItemTopping, Payment, Customer, OrderStatusHistory; state machines; price snapshot; validation rules
- `order-api`: NestJS order module — create, list, get, confirm, reject, update status, verify payment; admin endpoints
- `order-ui`: Next.js order management — admin order list/detail with alerts; client order placement form (online + direct)
- `order-notifications`: Admin alert system (visual + sound) on new order arrival; polling for status updates

### Modified Capabilities
- `shared-kernel`: Add order-related DTOs, Zod schemas, status enums, payment method enums to `packages/shared`

## Approach

1. **Prisma schema first**: Add all domain models to `schema.prisma` with proper relations, enums (`OrderStatus`, `PaymentStatus`, `PaymentMethod`, `OrderOrigin`), and indexes (order code unique, customer phone, order status). Migration on existing DB.
2. **Shared kernel expansion**: Order DTOs, validation schemas, status enums in `packages/shared` — web and api import from single source.
3. **NestJS order module**: `apps/api` gets `orders/` module with controller, service, DTOs. Hexagonal: service layer contains business logic, controller is thin HTTP adapter.
4. **Next.js order pages**: Admin route `/admin/orders` (list + detail with alerts), client-facing route `/pedidos` (order form). Atomic Design: molecules for order items, organisms for order form, templates for admin layout.
5. **Price snapshot**: On order creation, fetch current product/variant/topping prices from DB and store in `OrderItem.priceAtOrder` / `OrderItemTopping.priceAtOrder`. Never read prices live from catalog for existing orders.
6. **Notifications**: Polling-based admin dashboard refresh (30s interval) with visual indicator + browser Notification API (with permission) for new orders. Sound alert via Web Audio API. Push deferred.
7. **Validation**: Server-side Zod + class-validator; business hours check via config. Client-side form validation mirrors server rules.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `packages/shared/src/` | Modified | Add order DTOs, enums, Zod schemas |
| `apps/api/src/orders/` | New | NestJS order module (controller, service, DTOs, entities) |
| `apps/api/prisma/schema.prisma` | Modified | Order domain models + migrations |
| `apps/web/app/admin/orders/` | New | Admin order management pages |
| `apps/web/app/pedidos/` | New | Client order placement flow |
| `apps/web/components/orders/` | New | Order-related UI components (Atomic Design) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Price drift between catalog and order snapshot | Med | Snapshot prices atomically on order creation; never use catalog price for existing orders |
| Status machine invalid transitions | Low | Enum + service-layer guards; Prisma enum enforces valid values |
| Concurrent order creation overselling | Med | Optimistic lock on product stock (deferred to inventory phase; for now, admin validates) |
| Notification sound annoying in office | Low | Sound opt-in in admin settings; default off |
| PWA offline order queue complexity | High | Defer offline order queue to separate phase; online-only for MVP |

## Rollback Plan

Order domain is additive — new tables, new API routes, new pages. No existing functionality to break. Revert via `git revert` of the feature branch. Prisma migration is additive (new tables only); rollback = drop tables. If data exists in orders table, export before revert. CI gate prevents broken merges.

## Dependencies

- `persistence-foundation` (Prisma + Docker Postgres) — already complete
- `api-skeleton` (NestJS + health + validation) — already complete
- `shared-kernel` (DTOs + Zod) — already complete
- `web-shell` (Next.js PWA) — already complete
- No external services required (no payment gateway, no push service)

## Success Criteria

- [ ] `prisma migrate` applies cleanly with new order domain tables
- [ ] `POST /api/v1/orders` creates an order with price snapshot and returns order code
- [ ] `GET /api/v1/orders` lists orders with status filter; `GET /api/v1/orders/:code` returns full order detail
- [ ] `PATCH /api/v1/orders/:code/status` transitions order status with history log
- [ ] `PATCH /api/v1/orders/:code/payment` updates payment status
- [ ] Admin page shows order list with real-time new-order alert (visual + sound)
- [ ] Client form validates product selection, delivery/pickup, client data, payment method
- [ ] Invalid transitions rejected with descriptive error
- [ ] `pnpm build` + `pnpm test` pass
- [ ] Zero cost — no paid services used

## Cost & PWA Note

**Cost**: All zero-tier. PostgreSQL via existing Docker/local setup. No payment gateway (manual verification). No push notification service (browser Notification API is free). No SMS (admin sees orders in dashboard). **PWA**: Order placement form is responsive and works in PWA shell. Offline order queue is explicitly deferred — orders require online connection in MVP. Admin dashboard polls for new orders (not push). Future: service worker caching of order history for offline viewing.

## Proposal Question Round (pace=auto — assumptions inline)

**Auto-assumptions** (proceed unless corrected in spec/design):

1. **Customer model**: `Customer` stored per order (not a separate user account). Same phone = same customer across orders, but no auth. Customer data denormalized into Order for historical accuracy.
2. **Order code format**: Alphanumeric, e.g. `MF-260901-001` (prefix + YYMMDD + sequence). Auto-generated server-side, immutable.
3. **Business hours**: Configurable in env/config (e.g., `BUSINESS_HOURS_START=08:00`, `BUSINESS_HOURS_END=20:00`). Orders outside hours rejected with message.
4. **Cancel window**: Orders can be cancelled by admin at any point before `EN CAMINO`. Client cannot self-cancel (no account).
5. **Payment verification**: Admin manually confirms payment status in dashboard. `EFECTIVO` auto-marks `NO APLICA` (no verification needed). Digital payments (`Nequi`, `Daviplata`, `Llave BRE-B`) require admin proof review.

**Questions for async review** (non-blocking):

1. Should the client see a live order status tracker (polling their order code), or is a "we'll contact you" message sufficient for MVP?
2. Should direct sales (in-person) skip the `NUEVO` state and go straight to `CONFIRMADO`, or do all orders enter the review queue?
3. Is there a maximum number of items per order, or should we support arbitrarily large orders?
4. Should the admin be able to add/edit toppings after order creation, or is the order immutable once placed?
