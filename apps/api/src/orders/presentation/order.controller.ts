import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { OrderService } from "../application/order.service.js";
import { BusinessHoursGuard } from "../guards/business-hours.guard.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  updatePaymentSchema,
} from "@maison-fraise/shared";

@Controller("orders")
export class OrderController {
  constructor(private service: OrderService) {}

  @Post()
  @UseGuards(BusinessHoursGuard)
  create(@Body(new ZodValidationPipe(createOrderSchema)) body: any) {
    return this.service.createOrder(body);
  }

  @Get()
  list(
    @Query("status") status?: string,
    @Query("origin") origin?: string,
  ) {
    return this.service.listOrders({ status, origin });
  }

  @Get("pending")
  pending() {
    return this.service.listOrders({ status: "NUEVO" });
  }

  @Get(":code")
  getByCode(@Param("code") code: string) {
    return this.service.getByCode(code);
  }

  @Patch(":id/status")
  updateStatus(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateOrderStatusSchema)) body: any,
  ) {
    return this.service.updateStatus(id, body.status, body.note);
  }

  @Patch(":id/payment")
  updatePayment(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updatePaymentSchema)) body: any,
  ) {
    return this.service.updatePayment(id, body.status, body.note);
  }
}
