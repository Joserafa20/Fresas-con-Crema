import { describe, it, expect } from "vitest";
import { HealthResponseSchema } from "./schemas/health.js";
import { RoleSchema } from "./constants/roles.js";

describe("shared kernel", () => {
  it("validates health response", () => {
    expect(HealthResponseSchema.safeParse({ status: "ok" }).success).toBe(true);
    expect(HealthResponseSchema.safeParse({ status: "bad" }).success).toBe(false);
  });

  it("validates roles", () => {
    expect(RoleSchema.safeParse("admin").success).toBe(true);
    expect(RoleSchema.safeParse("unknown").success).toBe(false);
  });

  it("invalid DTO fails with issue on field", () => {
    const schema = RoleSchema;
    const result = schema.safeParse("invalid");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.length).toBeGreaterThan(0);
  });
});
