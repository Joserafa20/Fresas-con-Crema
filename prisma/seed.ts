import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const toppingsData = [
    { name: "Oreo", priceCents: 1500 },
    { name: "Quipitos", priceCents: 1500 },
    { name: "Leche en polvo", priceCents: 1500 },
    { name: "Piazza", priceCents: 1500 },
    { name: "Chip negro", priceCents: 1500 },
    { name: "M&M", priceCents: 1500 },
  ];

  const toppings = [];
  for (const t of toppingsData) {
    const topping = await prisma.topping.upsert({
      where: { name: t.name },
      update: { priceCents: t.priceCents },
      create: t,
    });
    toppings.push(topping);
  }
  console.log(`Seeded ${toppings.length} toppings`);

  const productsData = [
    {
      slug: "fresas-con-crema-9oz",
      name: "Fresas con Crema 9oz",
      description: "Fresas frescas con crema artesanal — porción 9oz",
      sortOrder: 1,
      variants: [{ name: "9oz", priceCents: 10000 }],
    },
    {
      slug: "fresas-con-crema-12oz",
      name: "Fresas con Crema 12oz",
      description: "Fresas frescas con crema artesanal — porción 12oz",
      sortOrder: 2,
      variants: [{ name: "12oz", priceCents: 12000 }],
    },
    {
      slug: "fresas-con-crema-16oz",
      name: "Fresas con Crema 16oz",
      description: "Fresas frescas con crema artesanal — porción 16oz",
      sortOrder: 3,
      variants: [{ name: "16oz", priceCents: 15000 }],
    },
    {
      slug: "bowl-chocolate",
      name: "Bowl Chocolate",
      description: "Bowl de fresas con chocolate",
      sortOrder: 4,
      variants: [{ name: "Estándar", priceCents: 15000 }],
    },
    {
      slug: "oreo-12oz",
      name: "Oreo 12oz",
      description: "Fresas con crema y trozos de Oreo — 12oz",
      sortOrder: 5,
      variants: [{ name: "12oz", priceCents: 12500 }],
    },
  ];

  // For FASE 2 seed requirement: at least 3 products + variants + 6 toppings M2M
  // Upsert each product with its variants and link all 6 toppings
  for (const p of productsData.slice(0, 3)) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: { name: p.name, description: p.description, sortOrder: p.sortOrder, isActive: true },
      create: { slug: p.slug, name: p.name, description: p.description, sortOrder: p.sortOrder, isActive: true },
    });

    for (const v of p.variants) {
      const existing = await prisma.productVariant.findFirst({
        where: { productId: product.id, name: v.name },
      });
      let variant;
      if (existing) {
        variant = await prisma.productVariant.update({
          where: { id: existing.id },
          data: { priceCents: v.priceCents },
        });
      } else {
        variant = await prisma.productVariant.create({
          data: { productId: product.id, name: v.name, priceCents: v.priceCents },
        });
        await prisma.priceHistory.create({
          data: { variantId: variant.id, priceCents: v.priceCents },
        });
      }
    }

    for (const topping of toppings) {
      await prisma.productTopping.upsert({
        where: { productId_toppingId: { productId: product.id, toppingId: topping.id } },
        update: {},
        create: { productId: product.id, toppingId: topping.id },
      });
    }
  }

  // Also seed the other 2 products for completeness (without failing idempotency)
  for (const p of productsData.slice(3)) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: { name: p.name, description: p.description, sortOrder: p.sortOrder, isActive: true },
      create: { slug: p.slug, name: p.name, description: p.description, sortOrder: p.sortOrder, isActive: true },
    });
    for (const v of p.variants) {
      const existing = await prisma.productVariant.findFirst({
        where: { productId: product.id, name: v.name },
      });
      if (!existing) {
        const variant = await prisma.productVariant.create({
          data: { productId: product.id, name: v.name, priceCents: v.priceCents },
        });
        await prisma.priceHistory.create({
          data: { variantId: variant.id, priceCents: v.priceCents },
        });
      }
    }
    for (const topping of toppings) {
      await prisma.productTopping.upsert({
        where: { productId_toppingId: { productId: product.id, toppingId: topping.id } },
        update: {},
        create: { productId: product.id, toppingId: topping.id },
      });
    }
  }

  console.log("Seed completed: 5 products with variants + 6 toppings linked");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
