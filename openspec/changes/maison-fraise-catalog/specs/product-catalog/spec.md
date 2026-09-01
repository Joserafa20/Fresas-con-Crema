# product-catalog Specification

## Purpose

Core catalog domain: products, variants, toppings and their relations. Customer-facing read and admin CRUD power the mobile-first catalog without cart/orders scope.

## Requirements

### Requirement: Product Entity and Visibility

The system SHALL model `Product` with `name`, `description`, `isActive` (boolean), `sortOrder` (integer), and timestamps; customer-facing queries MUST return only `isActive=true` ordered by `sortOrder ASC` then `name`.

#### Scenario: Customer lists active products ordered

- GIVEN products with varied `isActive` and `sortOrder`
- WHEN a customer calls `GET /api/v1/products`
- THEN response contains only `isActive=true` sorted by `sortOrder ASC`

#### Scenario: Inactive product hidden from customer

- GIVEN a product with `isActive=false`
- WHEN a customer calls `GET /api/v1/products/:id`
- THEN response is 404

### Requirement: Variant per Product

The system SHALL allow 1..N `Variant` per `Product` each with `name` (e.g. 9oz/12oz/16oz) and COP price (`priceCents` integer >=0); deleting a product MUST cascade or reject if variants exist per FK policy defined in design.

#### Scenario: Create product with variants

- GIVEN admin creates product with 3 variants (9oz/12oz/16oz)
- WHEN POST succeeds
- THEN each variant is persisted linked to product and returned

#### Scenario: Variant without product rejected

- GIVEN a variant payload with non-existent `productId`
- WHEN creating variant
- THEN API returns 400/404

### Requirement: Topping M2M per Product

The system SHALL model 6 base toppings (Oreo, Quipitos, Leche polvo, Piazza, Chip negro, M&M) as `Topping` and associate via `ProductTopping` M2M per-product; product detail MUST expose allowed toppings.

#### Scenario: Product exposes allowed toppings

- GIVEN product A linked to 4 toppings
- WHEN customer fetches product detail
- THEN `toppings` array contains exactly those 4

#### Scenario: Assign unknown topping rejected

- GIVEN admin assigns non-existent topping id to product
- WHEN request is sent
- THEN API returns 404/400

### Requirement: Admin CRUD with RBAC

The system SHALL gate all catalog mutations (`POST/PUT/PATCH/DELETE` products, variants, toppings, assignments) to role `admin`; non-admin MUST receive 403.

#### Scenario: Admin creates product

- GIVEN authenticated user with `admin` role
- WHEN POST `/api/v1/products`
- THEN 201 with created product

#### Scenario: Non-admin blocked

- GIVEN authenticated user with `seller` role
- WHEN POST `/api/v1/products`
- THEN 403 Forbidden

## Non-goals

- Cart, orders, payments, inventory, deliveries, search, reviews.

## Dependencies

- `persistence-foundation` (Prisma Postgres), `api-skeleton` (NestJS prefix), `shared-kernel` (DTOs), `catalog-pricing` (price source), `catalog-media` (images).

## Success Criteria

- Seed creates 3 products + variants + 6 toppings linked; customer `GET /api/v1/products` returns active ordered with variants/toppings/images; admin CRUD requires `admin` role.
