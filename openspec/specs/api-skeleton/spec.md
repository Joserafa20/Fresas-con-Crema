# Delta for api-skeleton

## Overview
NestJS TypeScript API skeleton exposing versioned health and validation baseline; foundation for future domain modules under `/api/v1`.

## ADDED Requirements

### Requirement: NestJS Application and Versioned Prefix
The system SHALL scaffold `apps/api` with NestJS TypeScript, global prefix `/api/v1`, CORS enabled, and global `ValidationPipe` (whitelist, forbidNonWhitelisted, transform).

#### Scenario: Health endpoint returns 200
- GIVEN the API is running
- WHEN the client calls `GET /api/v1/health`
- THEN the response is 200 with `{ status: "ok" }` and JSON content-type

#### Scenario: Validation rejects unknown properties
- GIVEN ValidationPipe is enabled
- WHEN a request body contains an extra property not in the DTO
- THEN the API responds 400 with a validation error

### Requirement: Configuration and Env Validation
The system SHALL load configuration via `@nestjs/config` and validate required env vars with Zod at startup, failing fast on missing values; no secrets SHALL be committed.

#### Scenario: Missing env fails fast
- GIVEN a required env var is absent
- WHEN the API starts
- THEN startup fails with a descriptive validation error

## Non-goals
- Domain CRUD; auth/JWT implementation; DB connectivity beyond config; production deploy.

## Dependencies
- `monorepo-workspace`, `shared-kernel` (DTOs/constants), `persistence-foundation` config only.

## Success Criteria
- `pnpm --filter api start` boots; `GET /api/v1/health` 200; ValidationPipe active; env validated via Zod; CORS enabled.
