# Delta for quality-gates

## Overview
Quality gates ensuring every PR is linted, type-checked, formatted, and tested before merge, with CI as free-tier placeholder.

## ADDED Requirements

### Requirement: Lint, Format, and Typecheck
The system SHALL configure ESLint (flat config, TypeScript) and Prettier at root and per-workspace, and SHALL expose `pnpm lint`, `pnpm format`, `pnpm typecheck` (`tsc --noEmit`) that MUST pass on the foundation code.

#### Scenario: Lint catches violation
- GIVEN a file violates ESLint rules
- WHEN `pnpm lint` runs
- THEN the command exits non-zero reporting the violation

#### Scenario: Type error blocks typecheck
- GIVEN a TypeScript type error exists
- WHEN `pnpm typecheck` runs
- THEN the command fails with the type error location

### Requirement: Test Runner and CI
The system SHALL configure Vitest with `pnpm test` and `pnpm coverage` placeholders and SHALL provide `.github/workflows/ci.yml` that on push/PR runs install, lint, typecheck, test, and build using free-tier runners; Husky/lint-staged MAY be added as optional pre-commit.

#### Scenario: CI pipeline passes on clean code
- GIVEN a PR with passing lint, typecheck, tests, and build
- WHEN the `ci.yml` workflow runs
- THEN all jobs succeed and the PR is green

#### Scenario: Pre-commit hook blocks bad commit (optional)
- GIVEN Husky/lint-staged is configured
- WHEN a commit contains lint errors
- THEN the commit is blocked with lint output

## Non-goals
- 70% coverage enforcement (until domain code); Playwright E2E; branch protection rules.

## Dependencies
- `monorepo-workspace`, `web-shell`, `api-skeleton`, `shared-kernel`. No external CI service beyond GitHub Actions.

## Success Criteria
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` pass; `ci.yml` exists and runs those steps; Prettier configured; no secrets in CI.
