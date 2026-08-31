# Delta for shared-kernel

## Overview
Single source of truth in `packages/shared` for DTOs, constants, and Zod validation shared by web and api, enforcing hexagonal domain isolation.

## ADDED Requirements

### Requirement: Shared Package Exports
The system SHALL expose `packages/shared` as a workspace package exporting DTOs, Zod schemas, and constants (roles `admin|seller|delivery`, locale `es-CO`, currency `COP`) importable by both `apps/web` and `apps/api`.

#### Scenario: Shared import works in both apps
- GIVEN `packages/shared` is built
- WHEN `apps/web` and `apps/api` import `{ Roles }` from `@maison-fraise/shared` (or `packages/shared`)
- THEN the import resolves and types are available

### Requirement: Zod Validation Schemas
The system SHALL define Zod schemas for shared DTOs (e.g., health response, pagination) and re-export them; schemas MUST validate at runtime and provide TypeScript types via `z.infer`.

#### Scenario: Invalid DTO fails validation
- GIVEN a Zod schema for a shared DTO requires `email` as email
- WHEN `schema.safeParse({ email: "bad" })` is called
- THEN the result is `success: false` with an issue on `email`

## Non-goals
- Domain entities (catalog/orders/inventory) — deferred; business logic; UI components.

## Dependencies
- `monorepo-workspace` (tsconfig, pnpm). No runtime services.

## Success Criteria
- `packages/shared` builds and is importable from web/api; at least one Zod schema with inferred type; no duplicated DTO definitions across apps.
