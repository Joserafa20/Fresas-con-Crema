import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PRODUCT_REPOSITORY } from "../ports/product.repository.js";
import type { ProductRepository } from "../ports/product.repository.js";

@Injectable()
export class CatalogService {
  constructor(@Inject(PRODUCT_REPOSITORY) private repo: ProductRepository) {}

  findActive() {
    return this.repo.findActive();
  }
  async findBySlug(slug: string) {
    const product = await this.repo.findBySlug(slug);
    if (!product || !product.isActive) throw new NotFoundException("Product not found");
    return product;
  }
  async findById(id: string) {
    const product = await this.repo.findById(id);
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }
  create(data: any) {
    return this.repo.create(data);
  }
  update(id: string, data: any) {
    return this.repo.update(id, data);
  }
  updateVariantPrice(variantId: string, priceCents: number) {
    return this.repo.updateVariantPrice(variantId, priceCents);
  }
  getPriceHistory(variantId: string) {
    return this.repo.getPriceHistory(variantId);
  }
  createImage(productId: string, data: any) {
    return this.repo.createImage(productId, data);
  }
  findVariants() {
    return this.repo.findVariants();
  }
  findToppings() {
    return this.repo.findToppings();
  }
}
