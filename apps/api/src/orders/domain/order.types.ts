import type { OrderStatus } from "@maison-fraise/shared";

/**
 * Valid order status transitions.
 * Terminal states (ENTREGADO, CANCELADO) have no outgoing transitions.
 */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NUEVO: ["CONFIRMADO", "CANCELADO"],
  CONFIRMADO: ["EN_PREPARACION", "CANCELADO"],
  EN_PREPARACION: ["LISTO", "CANCELADO"],
  LISTO: ["EN_CAMINO", "CANCELADO"],
  EN_CAMINO: ["ENTREGADO"],
  ENTREGADO: [],
  CANCELADO: [],
};

/**
 * Check whether a status transition is allowed.
 */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Payment method that auto-skips verification.
 * Cash (EFECTIVO) does not require admin verification.
 */
export const CASH_PAYMENT_METHODS = ["EFECTIVO"] as const;

/**
 * Business hours configuration interface.
 */
export interface BusinessHoursConfig {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}
