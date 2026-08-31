# Delta for web-shell

## Overview
Next.js 14+ App Router PWA shell for MAISON FRAISE: responsive placeholder home in `es-CO`, installable manifest, and offline-ready baseline without domain features.

## ADDED Requirements

### Requirement: Next.js App Router Shell
The system SHALL scaffold `apps/web` with Next.js 14+ TypeScript App Router, `lang="es"` and locale `es-CO`, currency `COP`, timezone `America/Bogota`, and a placeholder home route `/` rendering Spanish copy.

#### Scenario: Home renders in es-CO
- GIVEN the web app is running
- WHEN the user visits `/`
- THEN the page returns 200 with Spanish placeholder content and `html lang="es"`

### Requirement: PWA Manifest and Installability
The system SHALL provide `manifest.json` (name MAISON FRAISE, display standalone, theme color) and required icons so the shell is installable; service worker/offline queue MAY be deferred.

#### Scenario: Manifest served
- GIVEN the web app is running
- WHEN the client requests `/manifest.json` or `/manifest.webmanifest`
- THEN the response is 200 with valid JSON containing `name`, `display: standalone`, and icons

#### Scenario: Responsive shell
- GIVEN the home page is loaded at 375px and 1280px widths
- WHEN the viewport changes
- THEN layout remains usable with no horizontal overflow

## Non-goals
- Catalog/orders/inventory UI; auth flows; offline order queue; image storage; E2E tests.

## Dependencies
- `monorepo-workspace`, `shared-kernel` (constants/types). No backend required to render shell.

## Success Criteria
- `pnpm --filter web dev` serves `/` in es-CO; manifest valid and installable; responsive at mobile/desktop; `pnpm --filter web build` passes.
