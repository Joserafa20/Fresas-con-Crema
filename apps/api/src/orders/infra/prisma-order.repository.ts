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
}
