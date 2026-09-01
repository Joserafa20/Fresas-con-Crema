import type { CreateOrderInput } from "./schemas.js";

/**
 * Calculate the total order amount in cents from the validated order items.
 * Each item's priceAtOrder already includes its toppings sum.
 */
export function calculateOrderTotal(items: CreateOrderInput["items"]): number {
  return items.reduce((sum, item) => {
    const toppingsTotal = item.toppings.reduce(
      (tSum, t) => tSum + t.priceAtOrder,
      0,
    );
    const lineTotal = (item.priceAtOrder + toppingsTotal) * item.quantity;
    return sum + lineTotal;
  }, 0);
}
