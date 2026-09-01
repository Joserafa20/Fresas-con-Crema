import { describe, it, expect } from "vitest";
import { CASH_PAYMENT_METHODS } from "./order.types.js";

describe("order domain constants", () => {
  it("CASH_PAYMENT_METHODS includes EFECTIVO", () => {
    expect(CASH_PAYMENT_METHODS).toContain("EFECTIVO");
  });

  it("CASH_PAYMENT_METHODS has length 1", () => {
    expect(CASH_PAYMENT_METHODS).toHaveLength(1);
  });
});
