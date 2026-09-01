export const TOPPING_UNIT_PRICE = 1500 as const;
export const TOPPING_UNIT = 1500 as const;

export function calcTotalCents(baseCents: number, toppingCount: number): number {
  return baseCents + TOPPING_UNIT_PRICE * toppingCount;
}
