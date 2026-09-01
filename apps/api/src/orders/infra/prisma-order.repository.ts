import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { OrderRepository } from "../ports/order.repository.js";

const prisma = new PrismaClient();

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { toppings: true } },
        payment: true,
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
    });
  }

  async findByCode(code: string) {
    return prisma.order.findUnique({
      where: { code },
      include: {
        items: { include: { toppings: true } },
        payment: true,
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
    });
  }

  async findAll(filters?: { status?: string; origin?: string }) {
    const where: Record<string, any> = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.origin) where.origin = filters.origin;

    return prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        payment: true,
      },
    });
  }

  async create(data: {
    order: any;
    items: any[];
    payment: any;
    statusHistory: any;
  }) {
    return prisma.order.create({
      data: {
        ...data.order,
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            variantName: item.variantName,
            priceAtOrder: item.priceAtOrder,
            quantity: item.quantity,
            toppings: {
              create: item.toppings.map((t: any) => ({
                toppingId: t.toppingId,
                toppingName: t.toppingName,
                priceAtOrder: t.priceAtOrder,
              })),
            },
          })),
        },
        payment: { create: data.payment },
        statusHistory: { create: data.statusHistory },
      },
      include: {
        items: { include: { toppings: true } },
        payment: true,
        statusHistory: true,
      },
    });
  }

  async updateStatus(
    orderId: string,
    fromStatus: string,
    toStatus: string,
    note?: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: { status: toStatus as any },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: fromStatus as any,
          toStatus: toStatus as any,
          note,
        },
      });

      return order;
    });
  }

  async updatePayment(
    orderId: string,
    status: string,
    note?: string,
  ) {
    return prisma.payment.update({
      where: { orderId },
      data: {
        status: status as any,
        note,
      },
    });
  }

  async countTodayOrders(date: Date): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
  }

  async getStats() {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // All orders (excluding cancelled)
    const allOrders = await prisma.order.findMany({
      where: { status: { not: "CANCELADO" } },
      include: { items: true, payment: true },
      orderBy: { createdAt: "desc" },
    });

    const todayOrders = allOrders.filter((o) => o.createdAt >= startOfDay);
    const weekOrders = allOrders.filter((o) => o.createdAt >= startOfWeek);
    const monthOrders = allOrders.filter((o) => o.createdAt >= startOfMonth);

    const totalRevenue = allOrders.reduce((s, o) => s + o.totalCents, 0);
    const todayRevenue = todayOrders.reduce((s, o) => s + o.totalCents, 0);
    const weekRevenue = weekOrders.reduce((s, o) => s + o.totalCents, 0);
    const monthRevenue = monthOrders.reduce((s, o) => s + o.totalCents, 0);

    // Top products
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    for (const order of allOrders) {
      for (const item of order.items) {
        const key = item.productName;
        const existing = productMap.get(key) ?? { name: key, quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
        existing.revenue += item.priceAtOrder * item.quantity;
        productMap.set(key, existing);
      }
    }
    const topProducts = [...productMap.values()].sort((a, b) => b.revenue - a.revenue);

    // By payment method
    const paymentMap = new Map<string, { count: number; revenue: number }>();
    for (const order of allOrders) {
      const method = order.payment?.method ?? "DESCONOCIDO";
      const existing = paymentMap.get(method) ?? { count: 0, revenue: 0 };
      existing.count += 1;
      existing.revenue += order.totalCents;
      paymentMap.set(method, existing);
    }
    const byPayment = [...paymentMap.entries()].map(([method, data]) => ({ method, ...data }));

    // By delivery method
    const deliveryMap = new Map<string, { count: number; revenue: number }>();
    for (const order of allOrders) {
      const method = order.deliveryMethod;
      const existing = deliveryMap.get(method) ?? { count: 0, revenue: 0 };
      existing.count += 1;
      existing.revenue += order.totalCents;
      deliveryMap.set(method, existing);
    }
    const byDelivery = [...deliveryMap.entries()].map(([method, data]) => ({ method, ...data }));

    // Top toppings
    const toppingMap = new Map<string, { name: string; count: number; revenue: number }>();
    for (const order of allOrders) {
      for (const item of order.items) {
        // toppings are nested in items but not included in this query
      }
    }

    // Status breakdown
    const statusMap = new Map<string, number>();
    for (const order of allOrders) {
      statusMap.set(order.status, (statusMap.get(order.status) ?? 0) + 1);
    }
    const byStatus = [...statusMap.entries()].map(([status, count]) => ({ status, count }));

    return {
      totals: {
        orders: allOrders.length,
        revenue: totalRevenue,
        avgOrderValue: allOrders.length > 0 ? Math.round(totalRevenue / allOrders.length) : 0,
      },
      today: { orders: todayOrders.length, revenue: todayRevenue },
      week: { orders: weekOrders.length, revenue: weekRevenue },
      month: { orders: monthOrders.length, revenue: monthRevenue },
      topProducts,
      byPayment,
      byDelivery,
      byStatus,
    };
  }
}
