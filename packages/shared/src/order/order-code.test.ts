import { describe, it, expect } from "vitest";
import { generateOrderCode } from "@maison-fraise/shared";

describe("generateOrderCode", () => {
  it("returns MF-YYMMDD-NNN format", () => {
    const code = generateOrderCode(0, new Date("2026-09-01T12:00:00Z"));
    expect(code).toMatch(/^MF-\d{6}-\d{3}$/);
  });

  it("uses zero-padded sequence starting at 001", () => {
    const code = generateOrderCode(0, new Date("2026-09-01T12:00:00Z"));
    expect(code).toBe("MF-260901-001");
  });

  it("increments sequence based on count", () => {
    const code = generateOrderCode(5, new Date("2026-09-01T12:00:00Z"));
    expect(code).toBe("MF-260901-006");
  });

  it("handles double-digit months and days", () => {
    const code = generateOrderCode(0, new Date("2026-12-25T12:00:00Z"));
    expect(code).toBe("MF-261225-001");
  });

  it("handles triple-digit sequence", () => {
    const code = generateOrderCode(999, new Date("2026-09-01T12:00:00Z"));
    expect(code).toBe("MF-260901-1000");
  });
});
