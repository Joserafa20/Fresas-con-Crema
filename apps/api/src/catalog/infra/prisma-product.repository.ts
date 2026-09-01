import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { ProductRepository } from "../ports/product.repository.js";

const prisma = new PrismaClient();

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  async findActive() {
    return prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        variants: { where: { isActive: true } },
        toppings: { include: { topping: true } },
        images: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      },
    });
  }
  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        toppings: { include: { topping: true } },
        images: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      },
    });
  }
  async findBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        variants: true,
        toppings: { include: { topping: true } },
        images: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      },
    });
  }
  async create(data: any) {
    const { variants, toppingIds, ...product } = data;
    return prisma.$transaction(async (tx) => {
      const created = await tx.product.create({ data: product });
      if (variants?.length) {
        for (const v of variants) {
          const variant = await tx.productVariant.create({
            data: { productId: created.id, name: v.name, priceCents: v.priceCents },
          });
          await tx.priceHistory.create({ data: { variantId: variant.id, priceCents: v.priceCents } });
        }
      }
      if (toppingIds?.length) {
        for (const tid of toppingIds) {
          await tx.productTopping.create({ data: { productId: created.id, toppingId: tid } });
        }
      }
      return tx.product.findUnique({
        where: { id: created.id },
        include: { variants: true, toppings: { include: { topping: true } }, images: true },
      });
    });
  }
  async update(id: string, data: any) {
    return prisma.product.update({ where: { id }, data });
  }
  async updateVariantPrice(variantId: string, priceCents: number) {
    return prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.update({ where: { id: variantId }, data: { priceCents } });
      await tx.priceHistory.create({ data: { variantId, priceCents } });
      return variant;
    });
  }
  async getPriceHistory(variantId: string) {
    return prisma.priceHistory.findMany({ where: { variantId }, orderBy: { effectiveFrom: "desc" } });
  }
  async createImage(productId: string, data: any) {
    return prisma.productImage.create({ data: { productId, ...data } });
  }
  async findVariants() {
    return prisma.productVariant.findMany();
  }
  async findToppings() {
    return prisma.topping.findMany();
  }
}
