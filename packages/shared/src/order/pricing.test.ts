import { describe, it, expect } from "vitest";
import { calculateOrderTotal } from "@maison-fraise/shared";
import type { CreateOrderInput } from "@maison-fraise/shared";

describe("calculateOrderTotal", () => {
  const baseItem: CreateOrderInput["items"][number] = {
    productId: "clx1234567890",
    variantId: "clx1234567891",
    productName: "Fresas con Crema",
    variantName: "Regular",
    priceAtOrder: 12000,
    quantity: 1,
    toppings: [],
  };

  it("calculates single item without toppings", () => {
    const total = calculateOrderTotal([baseItem]);
    expect(total).toBe(12000);
  });

  it("calculates single item with toppings", () => {
    const item = {
      ...baseItem,
      toppings: [
        { toppingId: "clx123", toppingName: "Leche condensada", priceAtOrder: 1500 },
        { toppingId: "clx456", toppingName: "Nueces", priceAtOrder: 2000 },
      ],
    };
    const total = calculateOrderTotal([item]);
    // (12000 + 1500 + 2000) * 1 = 15500
    expect(total).toBe(15500);
  });

  it("calculates multiple items with quantities", () => {
    const items = [
      { ...baseItem, priceAtOrder: 12000, quantity: 2 },
      { ...baseItem, priceAtOrder: 15000, quantity: 1 },
    ];
    const total = calculateOrderTotal(items);
    // (12000 * 2) + (15000 * 1) = 39000
    expect(total).toBe(39000);
  });

  it("calculates complex order with toppings and quantities", () => {
    const items = [
      {
        ...baseItem,
        priceAtOrder: 12000,
        quantity: 2,
        toppings: [
          { toppingId: "clx123", toppingName: "Leche condensada", priceAtOrder: 1500 },
        ],
      },
      {
        ...baseItem,
        productId: "clx9999999999",
        priceAtOrder: 15000,
        quantity: 1,
        toppings: [
          { toppingId: "clx123", toppingName: "Leche condensada", priceAtOrder: 1500 },
          { toppingId: "clx456", toppingName: "Nueces", priceAtOrder: 2000 },
        ],
      },
    ];
    const total = calculateOrderTotal(items);
    // item1: (12000 + 1500) * 2 = 27000
    // item2: (15000 + 1500 + 2000) * 1 = 18500
    // total: 45500
    expect(total).toBe(45500);
  });

  it("returns 0 for empty items array", () => {
    expect(calculateOrderTotal([])).toBe(0);
  });
});
