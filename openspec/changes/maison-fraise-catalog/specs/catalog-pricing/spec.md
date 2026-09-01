# catalog-pricing Specification

## Purpose

DB-backed pricing, append-only history, and deterministic COP total calculation (`base + 1500 * n`). No hardcoded prices in code.

## Requirements

### Requirement: DB-Backed Prices

The system SHALL store every `Variant.priceCents` and current price solely in PostgreSQL; the API and web MUST read prices from DB and MUST NOT contain hardcoded COP values.

#### Scenario: Price change reflects without deploy

- GIVEN variant price is 12000 in DB
- WHEN admin updates price to 13000 via API
- THEN subsequent `GET /api/v1/products` returns 13000 without redeploy

#### Scenario: Hardcoded price detection

- GIVEN CI runs price grep
- WHEN codebase contains literal `10000`/`12000`/`15000` as catalog price
- THEN CI fails

### Requirement: Append-Only Price History

The system SHALL maintain `PriceHistory` with `variantId`, `priceCents`, `effectiveFrom` (timestamp) append-only; updates MUST insert a new row and MUST NOT mutate or delete history; history MUST be queryable per variant ordered by `effectiveFrom DESC`.

#### Scenario: Price update appends history

- GIVEN variant with one history row
- WHEN admin updates price
- THEN history count increments by 1 and latest row matches new price

#### Scenario: History immutability

- GIVEN a history row exists
- WHEN any client attempts `DELETE /price-history/:id` or direct mutation
- THEN operation is rejected (no such endpoint / DB constraint)

### Requirement: Topping Price Calculation

The system SHALL compute customer total as `totalCents = variant.priceCents + 1500 * selectedToppingCount`; unit topping price 1500 MUST be a shared constant; server MUST recompute total and not trust client total.

#### Scenario: Total with 2 toppings

- GIVEN variant base 12000 and 2 toppings selected
- WHEN total is calculated
- THEN result is 15000 (`12000+3000`)

#### Scenario: Zero toppings

- GIVEN variant base 15000 and 0 toppings
- WHEN total is calculated
- THEN result equals base (15000)

#### Scenario: Client total ignored

- GIVEN client sends `total: 1`
- WHEN order preview (or catalog total endpoint) processes request
- THEN server returns computed `base+1500*n`, ignoring client value

## Non-goals

- Discounts, coupons, taxes, currency conversion, payment capture.

## Dependencies

- `product-catalog` (Variant/Topping), `persistence-foundation`, `shared-kernel` (pricing helpers, zod).

## Success Criteria

- Prices served from DB; history append-only verifiable via `GET /api/v1/variants/:id/price-history`; `base+1500*n` matches for 0..6 toppings; CI grep finds no hardcoded prices.
