export interface OrderRepository {
  findById(id: string): Promise<any | null>;
  findByCode(code: string): Promise<any | null>;
  findAll(filters?: { status?: string; origin?: string }): Promise<any[]>;
  create(data: any): Promise<any>;
  updateStatus(
    orderId: string,
    fromStatus: string,
    toStatus: string,
    note?: string,
  ): Promise<any>;
  updatePayment(
    orderId: string,
    status: string,
    note?: string,
  ): Promise<any>;
  countTodayOrders(date: Date): Promise<number>;
}
export const ORDER_REPOSITORY = Symbol("ORDER_REPOSITORY");
