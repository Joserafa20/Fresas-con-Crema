import { describe, it, expect } from "vitest";
import { calcTotalCents, TOPPING_UNIT_PRICE } from "./pricing.js";

describe("pricing", () => {
  it("TOPPING_UNIT_PRICE is 1500", () => {
    expect(TOPPING_UNIT_PRICE).toBe(1500);
  });
  it("calcTotalCents base+1500*n", () => {
    expect(calcTotalCents(12000, 2)).toBe(15000);
    expect(calcTotalCents(15000, 0)).toBe(15000);
    expect(calcTotalCents(10000, 6)).toBe(19000);
  });
  it("handles 0..6 toppings", () => {
    for (let n = 0; n <= 6; n++) {
      expect(calcTotalCents(10000, n)).toBe(10000 + 1500 * n);
    }
  });
});
