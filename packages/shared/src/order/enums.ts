import { z } from "zod";

export const OrderStatusSchema = z.enum([
  "NUEVO",
  "CONFIRMADO",
  "EN_PREPARACION",
  "LISTO",
  "EN_CAMINO",
  "ENTREGADO",
  "CANCELADO",
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const PaymentStatusSchema = z.enum([
  "PENDIENTE",
  "VERIFICANDO",
  "CONFIRMADO",
  "RECHAZADO",
  "NO_APLICA",
]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const PaymentMethodSchema = z.enum([
  "EFECTIVO",
  "NEQUI",
  "DAVIPLATA",
  "LLAVE_BRE_B",
]);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const OrderOriginSchema = z.enum(["ONLINE", "DIRECT"]);
export type OrderOrigin = z.infer<typeof OrderOriginSchema>;

export const DeliveryMethodSchema = z.enum(["pickup", "delivery"]);
export type DeliveryMethod = z.infer<typeof DeliveryMethodSchema>;
