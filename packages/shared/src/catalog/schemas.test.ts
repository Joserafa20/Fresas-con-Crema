import { describe, it, expect } from "vitest";
import { productSchema, productImageSchema, priceHistorySchema, productVariantSchema } from "./schemas.js";

describe("catalog schemas", () => {
  it("valid product passes", () => {
    expect(productSchema.safeParse({ name: "Fresas 9oz", slug: "fresas-9oz", sortOrder: 1, isActive: true }).success).toBe(true);
  });
  it("invalid price rejected", () => {
    const res = productVariantSchema.safeParse({ name: "9oz", priceCents: -1 });
    expect(res.success).toBe(false);
  });
  it("invalid MIME rejected", () => {
    expect(productImageSchema.safeParse({ url: "https://example.com/a.jpg", mimeType: "image/gif", sizeBytes: 1000 }).success).toBe(false);
  });
  it("size >5MB rejected", () => {
    expect(productImageSchema.safeParse({ url: "https://example.com/a.jpg", mimeType: "image/jpeg", sizeBytes: 6 * 1024 * 1024 }).success).toBe(false);
  });
  it("priceCents >=0", () => {
    expect(priceHistorySchema.safeParse({ variantId: "c".repeat(25), priceCents: -1 }).success).toBe(false);
  });
});
