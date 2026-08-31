import { describe, it, expect } from "vitest";
import { HealthService } from "./modules/health/health.service.js";
import { validateEnv } from "./config/env.schema.js";

describe("HealthService", () => {
  it("returns 200 {status: ok}", () => {
    const svc = new HealthService();
    expect(svc.check()).toEqual({ status: "ok" });
  });
});

describe("env validation", () => {
  it("fails when DATABASE_URL missing", () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL/);
  });
  it("passes with valid env", () => {
    expect(validateEnv({ DATABASE_URL: "postgresql://user:pass@localhost:5432/db" })).toBeDefined();
  });
});
