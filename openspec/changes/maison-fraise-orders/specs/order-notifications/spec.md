# Order Notifications Specification

## Purpose

Admin alert system for new order arrival: visual indicator + optional sound via Web Audio API. Client status polling. All polling-based; push deferred.

## Overview

Admin dashboard polls `/api/v1/orders/pending` every 30 seconds. New orders trigger visual badge + optional sound. Client tracking page polls order status every 15 seconds. No real-time push (PWA push deferred).

## Requirements

### Requirement: Admin Polling for New Orders

The system SHALL poll `/api/v1/orders/pending` every 30 seconds from the admin dashboard. Polling SHALL be active only when the admin orders page is open. Polling SHALL stop when the page is closed or the user navigates away.

#### Scenario: Polling active on page load

- GIVEN admin opens `/admin/orders`
- WHEN the page loads
- THEN polling starts with 30-second interval

#### Scenario: Polling stops on navigation

- GIVEN admin is on `/admin/orders` with active polling
- WHEN admin navigates to `/admin/products`
- THEN polling stops and no further requests are made

#### Scenario: Polling resumes on return

- GIVEN admin navigated away from `/admin/orders`
- WHEN admin returns to the page
- THEN polling restarts with fresh 30-second interval

### Requirement: Visual New Order Indicator

The system SHALL display a visual indicator when new orders are detected by polling. Indicator SHALL be a badge count on the "Orders" nav item and/or a highlight row on the order list. Indicator SHALL persist until the admin views the new order detail.

#### Scenario: Badge count on new order

- GIVEN admin has 2 unviewed new orders
- WHEN polling detects a 3rd new order
- THEN badge on "Orders" nav shows "3"

#### Scenario: Badge clears on view

- GIVEN admin has 3 unviewed new orders
- WHEN admin clicks on one new order detail
- THEN badge decrements to "2"

#### Scenario: Badge clears on list view

- GIVEN admin has 3 unviewed new orders
- WHEN admin views the order list page
- THEN all 3 orders are highlighted and badge clears after scroll

### Requirement: Sound Alert for New Orders

The system SHALL play a short audio alert when a new order is detected by polling. Sound SHALL be configurable via admin settings (enable/disable, volume). Default is disabled. Sound SHALL use Web Audio API or HTML5 Audio element.

#### Scenario: Sound plays when enabled

- GIVEN admin has enabled sound alerts
- WHEN polling detects a new order
- THEN a short alert sound plays

#### Scenario: Sound does not play when disabled

- GIVEN admin has disabled sound alerts
- WHEN polling detects a new order
- THEN no sound plays, only visual indicator

#### Scenario: Sound respects volume setting

- GIVEN admin sets alert volume to 50%
- WHEN a new order triggers alert
- THEN sound plays at reduced volume

### Requirement: Client Order Status Polling

The system SHALL poll order status every 15 seconds on the client tracking page (`/pedidos/seguimiento`). Polling SHALL stop when the user leaves the page or the order reaches a terminal status (`ENTREGADO`, `CANCELADO`).

#### Scenario: Status updates reflected

- GIVEN customer is viewing tracking for order in `CONFIRMADO`
- WHEN order transitions to `EN PREPARACIÓN`
- THEN tracking page displays updated status within 15 seconds

#### Scenario: Polling stops at terminal status

- GIVEN customer is tracking order in `LISTO`
- WHEN order transitions to `ENTREGADO`
- THEN polling stops and final status is displayed permanently

#### Scenario: Polling stops on navigation

- GIVEN customer is on tracking page
- WHEN they navigate away
- THEN polling stops

### Requirement: Polling Error Handling

The system SHALL handle polling failures gracefully. If a poll request fails, the system SHALL retry on the next interval cycle without crashing or showing error to the user. After 3 consecutive failures, a subtle "connection lost" indicator MAY be shown.

#### Scenario: Single poll failure

- GIVEN polling is active
- WHEN one poll request returns 500
- THEN the UI continues polling on the next interval without error display

#### Scenario: Multiple failures show indicator

- GIVEN 3 consecutive poll requests fail
- WHEN the 4th failure occurs
- THEN a "connection lost" indicator appears and polling continues

### Requirement: Sound File Configuration

The system SHALL provide a default alert sound (short beep/chime, < 2 seconds). The sound file SHALL be stored in `apps/web/public/sounds/` and configurable via admin settings to use a custom sound URL or the default.

#### Scenario: Default sound available

- GIVEN no custom sound configured
- WHEN alert triggers
- THEN default sound plays from `apps/web/public/sounds/order-alert.mp3`

#### Scenario: Custom sound configured

- GIVEN admin sets custom sound URL
- WHEN alert triggers
- THEN custom sound plays

## Non-goals

- Real-time push notifications (PWA push API deferred); SMS/email notifications; desktop notifications beyond browser tab; offline notification queue.

## Dependencies

- `order-api` (pending orders endpoint); `order-domain` (status models); `web-shell` (PWA shell).

## Success Criteria

- Admin polling triggers visual indicator + optional sound on new order; client tracking polls and reflects status changes; polling stops on navigation and terminal status; error handling is graceful; `pnpm build` passes.
