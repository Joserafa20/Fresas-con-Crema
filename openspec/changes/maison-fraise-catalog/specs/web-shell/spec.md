# Delta for web-shell

## Overview

Extends Next.js PWA shell with customer `/catalog` (ISR, responsive, sorted active products) and PWA caching; admin catalog UI remains online-only.

## ADDED Requirements

### Requirement: Customer Catalog Routes

The system SHALL provide `/catalog` (list) and `/catalog/[id]` (detail) rendering only `isActive=true` products ordered by `sortOrder ASC`; list SHALL use ISR (revalidate) and detail SHALL include variant picker with live `base+1500*n` total.

#### Scenario: Catalog lists active ordered

- GIVEN mixed active/inactive products
- WHEN user visits `/catalog`
- THEN only active products appear ordered by `sortOrder ASC`

#### Scenario: Detail shows variant and topping total

- GIVEN product with variant 12000 and 2 toppings selected
- WHEN user picks variant and toppings on `/catalog/[id]`
- THEN displayed total updates to 15000

#### Scenario: Inactive product 404

- GIVEN product `isActive=false`
- WHEN user visits `/catalog/[id]`
- THEN 404 / notFound

### Requirement: Mobile-First and Image Optimization

The system SHALL render `/catalog` usable at 375px with no horizontal overflow and SHALL deliver images via `next/image` (or equivalent) with responsive sizing.

#### Scenario: Mobile no overflow

- GIVEN `/catalog` at 375px
- WHEN rendered
- THEN no horizontal scroll and cards stack vertically

### Requirement: PWA Catalog Caching

The system SHALL cache catalog `GET` responses via service worker / Next PWA (SWR or CacheFirst for images/API) for offline browsing; admin routes SHOULD remain network-only.

#### Scenario: Catalog cached offline

- GIVEN user visited `/catalog` online
- WHEN offline and revisiting `/catalog`
- THEN cached catalog shell/data is served (stale-while-revalidate)

## MODIFIED Requirements

### Requirement: Next.js App Router Shell

The system SHALL scaffold `apps/web` with Next.js 14+ TypeScript App Router, `lang="es"` and locale `es-CO`, currency `COP`, timezone `America/Bogota`, and a placeholder home route `/` rendering Spanish copy. It SHALL now also include `/catalog` routes above sharing the same locale/currency/timezone and layout.
(Previously: shell only described `/` placeholder without catalog routes)

#### Scenario: Home renders in es-CO

- GIVEN the web app is running
- WHEN the user visits `/`
- THEN the page returns 200 with Spanish placeholder content and `html lang="es"`

### Requirement: PWA Manifest and Installability

The system SHALL provide `manifest.json` (name MAISON FRAISE, display standalone, theme color) and required icons so the shell is installable; catalog caching extends this baseline but installability MUST remain.
(Previously: manifest only, no catalog caching)

#### Scenario: Manifest served

- GIVEN the web app is running
- WHEN the client requests `/manifest.json` or `/manifest.webmanifest`
- THEN the response is 200 with valid JSON containing `name`, `display: standalone`, and icons

#### Scenario: Responsive shell

- GIVEN the home page is loaded at 375px and 1280px widths
- WHEN the viewport changes
- THEN layout remains usable with no horizontal overflow

## Non-goals

- Cart/orders checkout, auth flows beyond RBAC display, offline order queue.

## Dependencies

- `monorepo-workspace`, `shared-kernel`, `product-catalog`, `catalog-pricing`, `catalog-media`, `api-skeleton`.

## Success Criteria

- `/catalog` mobile-first 375px, ISR, active ordered; detail live total correct; PWA caches catalog; `pnpm --filter web build` passes.
