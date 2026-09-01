export interface ProductRepository {
  findActive(): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  findBySlug(slug: string): Promise<any | null>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  updateVariantPrice(variantId: string, priceCents: number): Promise<any>;
  getPriceHistory(variantId: string): Promise<any[]>;
  createImage(productId: string, data: any): Promise<any>;
  findVariants(): Promise<any[]>;
  findToppings(): Promise<any[]>;
}
export const PRODUCT_REPOSITORY = Symbol("PRODUCT_REPOSITORY");
