# Delta for monorepo-workspace

## Overview
Greenfield monorepo establishing pnpm workspaces, shared TypeScript config, and task orchestration so `apps/web`, `apps/api`, `packages/shared` build from a clean clone with zero-cost tooling.

## ADDED Requirements

### Requirement: Workspace Layout and Package Manager
The system SHALL define a pnpm workspace with `apps/*` and `packages/*` and a root `package.json` declaring `packageManager` and `engines` pinning Node 20+ and pnpm 9+.

#### Scenario: Clean clone install
- GIVEN a clean clone with Node 20+ and pnpm 9+
- WHEN the developer runs `pnpm install` at root
- THEN all workspace packages install without errors and `pnpm -r build` is available

#### Scenario: Wrong Node version rejected
- GIVEN Node 18 is active
- WHEN `pnpm install` runs
- THEN the engine check fails with a descriptive error

### Requirement: Shared TypeScript and Task Orchestration
The system SHALL provide a root `tsconfig.json` (strict, ESNext, bundler resolution) extended by each workspace and a `turbo.json` or `pnpm -r` task pipeline for `build`, `test`, `lint`, `typecheck`.

#### Scenario: Typecheck propagates
- GIVEN a type error in `packages/shared`
- WHEN `pnpm typecheck` runs at root
- THEN the command fails and reports the offending file

## Non-goals
- Domain packages beyond `shared`; Docker image builds; deployment orchestration.

## Dependencies
- Node 20+, pnpm 9+, Turborepo (optional). No external services.

## Success Criteria
- `pnpm install` and `pnpm -r build` pass on clean clone; `engines` enforced; root tsconfig strict.
