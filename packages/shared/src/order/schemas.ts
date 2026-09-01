import { z } from "zod";
import {
  OrderStatusSchema,
  PaymentStatusSchema,
  PaymentMethodSchema,
  OrderOriginSchema,
  DeliveryMethodSchema,
} from "./enums.js";

// ── Create Order DTOs ─────────────────────────────────────

const toppingPriceSchema = z
  .number()
  .int()
  .min(0, "Topping price must be non-negative");

const orderItemToppingSchema = z.object({
  toppingId: z.string().cuid(),
  toppingName: z.string().min(1),
  priceAtOrder: toppingPriceSchema,
});

const createOrderItemSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid(),
  productName: z.string().min(1),
  variantName: z.string().min(1),
  priceAtOrder: z.number().int().min(0, "Item price must be non-negative"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  toppings: z.array(orderItemToppingSchema).optional().default([]),
});

const customerInputSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  address: z.string().optional(),
  barrio: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const createOrderSchema = z
  .object({
    items: z
      .array(createOrderItemSchema)
      .min(1, "Order must have at least one item"),
    customer: customerInputSchema,
    deliveryMethod: DeliveryMethodSchema,
    paymentMethod: PaymentMethodSchema,
    origin: OrderOriginSchema.optional().default("ONLINE"),
  })
  .refine(
    (data) => {
      if (data.deliveryMethod === "delivery") {
        return !!data.customer.address;
      }
      return true;
    },
    {
      message: "Address is required for delivery orders",
      path: ["customer", "address"],
    },
  );

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// ── Update Status DTO ─────────────────────────────────────

export const updateOrderStatusSchema = z.object({
  status: OrderStatusSchema,
  note: z.string().optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

// ── Update Payment DTO ────────────────────────────────────

export const updatePaymentSchema = z.object({
  status: PaymentStatusSchema,
  note: z.string().optional(),
});

export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;

// ── Response Schemas ──────────────────────────────────────

export const orderItemToppingResponseSchema = z.object({
  id: z.string(),
  toppingId: z.string(),
  toppingName: z.string(),
  priceAtOrder: z.number(),
});

export const orderItemResponseSchema = z.object({
  id: z.string(),
  productId: z.string(),
  variantId: z.string(),
  productName: z.string(),
  variantName: z.string(),
  priceAtOrder: z.number(),
  quantity: z.number(),
  toppings: z.array(orderItemToppingResponseSchema),
});

export const paymentResponseSchema = z.object({
  id: z.string(),
  method: PaymentMethodSchema,
  status: PaymentStatusSchema,
  note: z.string().nullable(),
  createdAt: z.coerce.date(),
});

export const statusHistoryResponseSchema = z.object({
  id: z.string(),
  fromStatus: OrderStatusSchema,
  toStatus: OrderStatusSchema,
  note: z.string().nullable(),
  createdAt: z.coerce.date(),
});

export const orderResponseSchema = z.object({
  id: z.string(),
  code: z.string(),
  status: OrderStatusSchema,
  origin: OrderOriginSchema,
  deliveryMethod: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  address: z.string().nullable(),
  barrio: z.string().nullable(),
  reference: z.string().nullable(),
  notes: z.string().nullable(),
  totalCents: z.number(),
  items: z.array(orderItemResponseSchema),
  payment: paymentResponseSchema.nullable(),
  statusHistory: z.array(statusHistoryResponseSchema),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const orderListResponseSchema = z.array(
  orderResponseSchema.omit({ items: true, statusHistory: true }),
);

export type OrderResponse = z.infer<typeof orderResponseSchema>;
export type OrderListItem = z.infer<
  typeof orderListResponseSchema
>[number];

// ── Order Code Type ───────────────────────────────────────

export type OrderCode = `MF-${string}-${string}`;
