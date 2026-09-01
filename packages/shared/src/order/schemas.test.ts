import { describe, it, expect } from "vitest";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  updatePaymentSchema,
  OrderStatusSchema,
  PaymentStatusSchema,
  PaymentMethodSchema,
} from "@maison-fraise/shared";

describe("order Zod schemas", () => {
  describe("OrderStatusSchema", () => {
    it("accepts all valid statuses", () => {
      const valid = [
        "NUEVO", "CONFIRMADO", "EN_PREPARACION", "LISTO",
        "EN_CAMINO", "ENTREGADO", "CANCELADO",
      ];
      for (const s of valid) {
        expect(OrderStatusSchema.safeParse(s).success).toBe(true);
      }
    });

    it("rejects invalid status", () => {
      expect(OrderStatusSchema.safeParse("PENDIENTE").success).toBe(false);
    });
  });

  describe("PaymentStatusSchema", () => {
    it("accepts all valid payment statuses", () => {
      const valid = ["PENDIENTE", "VERIFICANDO", "CONFIRMADO", "RECHAZADO", "NO_APLICA"];
      for (const s of valid) {
        expect(PaymentStatusSchema.safeParse(s).success).toBe(true);
      }
    });
  });

  describe("PaymentMethodSchema", () => {
    it("accepts all valid payment methods", () => {
      const valid = ["EFECTIVO", "NEQUI", "DAVIPLATA", "LLAVE_BRE_B"];
      for (const s of valid) {
        expect(PaymentMethodSchema.safeParse(s).success).toBe(true);
      }
    });
  });

  describe("createOrderSchema", () => {
    const validOrder = {
      items: [
        {
          productId: "clx1234567890",
          variantId: "clx1234567891",
          productName: "Fresas con Crema",
          variantName: "Regular",
          priceAtOrder: 12000,
          quantity: 1,
          toppings: [],
        },
      ],
      customer: {
        name: "Juan Perez",
        phone: "3001234567",
      },
      deliveryMethod: "pickup",
      paymentMethod: "EFECTIVO",
    };

    it("accepts valid pickup order", () => {
      expect(createOrderSchema.safeParse(validOrder).success).toBe(true);
    });

    it("accepts valid delivery order with address", () => {
      const deliveryOrder = {
        ...validOrder,
        deliveryMethod: "delivery",
        customer: {
          ...validOrder.customer,
          address: "Calle 123",
        },
      };
      expect(createOrderSchema.safeParse(deliveryOrder).success).toBe(true);
    });

    it("rejects delivery order without address", () => {
      const deliveryOrder = {
        ...validOrder,
        deliveryMethod: "delivery",
      };
      expect(createOrderSchema.safeParse(deliveryOrder).success).toBe(false);
    });

    it("rejects order with no items", () => {
      expect(createOrderSchema.safeParse({ ...validOrder, items: [] }).success).toBe(false);
    });

    it("rejects order with invalid payment method", () => {
      expect(
        createOrderSchema.safeParse({ ...validOrder, paymentMethod: "TARJETA" }).success,
      ).toBe(false);
    });
  });

  describe("updateOrderStatusSchema", () => {
    it("accepts valid status", () => {
      expect(
        updateOrderStatusSchema.safeParse({ status: "CONFIRMADO" }).success,
      ).toBe(true);
    });

    it("accepts status with note", () => {
      expect(
        updateOrderStatusSchema.safeParse({ status: "CANCELADO", note: "Out of stock" }).success,
      ).toBe(true);
    });

    it("rejects invalid status", () => {
      expect(
        updateOrderStatusSchema.safeParse({ status: "PENDIENTE" }).success,
      ).toBe(false);
    });
  });

  describe("updatePaymentSchema", () => {
    it("accepts valid payment status", () => {
      expect(
        updatePaymentSchema.safeParse({ status: "CONFIRMADO" }).success,
      ).toBe(true);
    });
  });
});
