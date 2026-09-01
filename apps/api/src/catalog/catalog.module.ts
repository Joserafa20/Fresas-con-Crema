import { Module } from "@nestjs/common";
import { CatalogController } from "./presentation/catalog.controller.js";
import { CatalogService } from "./application/catalog.service.js";
import { PrismaProductRepository } from "./infra/prisma-product.repository.js";
import { PRODUCT_REPOSITORY } from "./ports/product.repository.js";

@Module({
  controllers: [CatalogController],
  providers: [
    CatalogService,
    { provide: PRODUCT_REPOSITORY, useClass: PrismaProductRepository },
  ],
  exports: [CatalogService],
})
export class CatalogModule {}
