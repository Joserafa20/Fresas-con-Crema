import { Module } from "@nestjs/common";
import { OrderController } from "./presentation/order.controller.js";
import { OrderService } from "./application/order.service.js";
import { PrismaOrderRepository } from "./infra/prisma-order.repository.js";
import { PrismaCustomerRepository } from "./infra/prisma-customer.repository.js";
import { ORDER_REPOSITORY } from "./ports/order.repository.js";
import { CUSTOMER_REPOSITORY } from "./ports/customer.repository.js";

@Module({
  controllers: [OrderController],
  providers: [
    OrderService,
    { provide: ORDER_REPOSITORY, useClass: PrismaOrderRepository },
    { provide: CUSTOMER_REPOSITORY, useClass: PrismaCustomerRepository },
  ],
  exports: [OrderService],
})
export class OrderModule {}
