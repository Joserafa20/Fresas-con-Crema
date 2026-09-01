export interface CustomerRepository {
  findByPhone(phone: string): Promise<any | null>;
  upsertByPhone(data: {
    name: string;
    phone: string;
  }): Promise<any>;
}
export const CUSTOMER_REPOSITORY = Symbol("CUSTOMER_REPOSITORY");
