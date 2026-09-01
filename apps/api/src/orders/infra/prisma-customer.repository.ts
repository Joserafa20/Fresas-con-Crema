import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { CustomerRepository } from "../ports/customer.repository.js";

const prisma = new PrismaClient();

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  async findByPhone(phone: string) {
    return prisma.customer.findUnique({ where: { phone } });
  }

  async upsertByPhone(data: { name: string; phone: string }) {
    return prisma.customer.upsert({
      where: { phone: data.phone },
      create: { name: data.name, phone: data.phone },
      update: { name: data.name },
    });
  }
}
