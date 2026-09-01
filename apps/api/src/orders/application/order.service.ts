import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import {
  type CreateOrderInput,
  type OrderStatus,
  generateOrderCode,
  calculateOrderTotal,
} from "@maison-fraise/shared";
import { ORDER_REPOSITORY } from "../ports/order.repository.js";
import { CUSTOMER_REPOSITORY } from "../ports/customer.repository.js";
import type { OrderRepository } from "../ports/order.repository.js";
import type { CustomerRepository } from "../ports/customer.repository.js";
import { canTransition, CASH_PAYMENT_METHODS } from "../domain/order.types.js";

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_REPOSITORY) private orderRepo: OrderRepository,
    @Inject(CUSTOMER_REPOSITORY) private customerRepo: CustomerRepository,
  ) {}

  async createOrder(dto: CreateOrderInput) {
    // 1. Calculate total from items
    const totalCents = calculateOrderTotal(dto.items);

    // 2. Upsert customer by phone
    const customer = await this.customerRepo.upsertByPhone({
      name: dto.customer.name,
      phone: dto.customer.phone,
    });

    // 3. Generate unique order code
    const todayCount = await this.orderRepo.countTodayOrders(new Date());
    const code = generateOrderCode(todayCount);

    // 4. Auto-set payment status for cash
    const paymentStatus = CASH_PAYMENT_METHODS.includes(
      dto.paymentMethod as any,
    )
      ? "NO_APLICA"
      : "PENDIENTE";

    // 5. Create order in transaction
    const order = await this.orderRepo.create({
      order: {
        code,
        status: "NUEVO",
        origin: dto.origin,
        deliveryMethod: dto.deliveryMethod,
        customerName: dto.customer.name,
        customerPhone: dto.customer.phone,
        address: dto.customer.address ?? null,
        barrio: dto.customer.barrio ?? null,
        reference: dto.customer.reference ?? null,
        notes: dto.customer.notes ?? null,
        totalCents,
        customerId: customer.id,
      },
      items: dto.items,
      payment: {
        method: dto.paymentMethod,
        status: paymentStatus,
      },
      statusHistory: {
        fromStatus: "NUEVO",
        toStatus: "NUEVO",
        note: "Order created",
      },
    });

    return {
      id: order.id,
      code: order.code,
      status: order.status,
      totalCents: order.totalCents,
      createdAt: order.createdAt,
    };
  }

  async listOrders(filters?: { status?: string; origin?: string }) {
    return this.orderRepo.findAll(filters);
  }

  async getByCode(code: string) {
    const order = await this.orderRepo.findByCode(code);
    if (!order) {
      throw new BadRequestException(`Order not found: ${code}`);
    }
    return order;
  }

  async updateStatus(
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
  ) {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new BadRequestException(`Order not found: ${orderId}`);
    }

    if (!canTransition(order.status, newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${order.status} to ${newStatus}`,
      );
    }

    return this.orderRepo.updateStatus(orderId, order.status, newStatus, note);
  }

  async updatePayment(
    orderId: string,
    status: string,
    note?: string,
  ) {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new BadRequestException(`Order not found: ${orderId}`);
    }

    return this.orderRepo.updatePayment(orderId, status, note);
  }

  async getStats() {
    return this.orderRepo.getStats();
  }
}
