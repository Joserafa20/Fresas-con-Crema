# Delta for persistence-foundation

## Overview
Local PostgreSQL 16 via `docker-compose.yml` and Prisma skeleton (`schema.prisma`, migrations, seed placeholder) as persistence baseline; no domain models yet.

## ADDED Requirements

### Requirement: Dockerized PostgreSQL
The system SHALL provide `docker-compose.yml` running PostgreSQL 16 with a named volume, healthcheck, and env-driven credentials documented in `.env.example`; `pnpm db:up` and `pnpm db:down` scripts SHOULD be available.

#### Scenario: Database starts via compose
- GIVEN Docker is running and `.env` is configured from `.env.example`
- WHEN the developer runs `docker-compose up -d`
- THEN the `db` service becomes healthy and accepts connections on the mapped port

### Requirement: Prisma Schema and Migrations
The system SHALL include `prisma/schema.prisma` with `provider = "postgresql"`, a `datasource` using `env("DATABASE_URL")`, a placeholder generator/client, and migration scripts (`prisma migrate dev`, `prisma generate`); the initial migration MUST apply cleanly on an empty DB.

#### Scenario: Migrate on empty DB succeeds
- GIVEN the Postgres container is healthy and `DATABASE_URL` is set
- WHEN `pnpm prisma migrate dev --name init` runs
- THEN the migration applies without error and `prisma generate` succeeds

#### Scenario: Missing DATABASE_URL fails fast
- GIVEN `DATABASE_URL` is unset
- WHEN Prisma commands run
- THEN the command fails with a descriptive missing-env error

## Non-goals
- Domain tables (products/orders/inventory); seed data beyond placeholder; production DB provisioning.

## Dependencies
- `monorepo-workspace`; Docker; Node 20+. No external DB required.

## Success Criteria
- `docker-compose up -d` healthy; `prisma migrate` and `prisma generate` succeed; `.env.example` documents `DATABASE_URL`; no secrets committed.
