export const TOPPING_UNIT_PRICE = 1500 as const;
export const TOPPING_UNIT = 1500 as const;

export function calcTotalCents(baseCents: number, toppingCount: number): number {
  return baseCents + TOPPING_UNIT_PRICE * toppingCount;
}

/** Format COP integer (e.g. 10000) as "$10.000" */
export function formatCop(cents: number): string {
  return `$${cents.toLocaleString("es-CO")}`;
}
