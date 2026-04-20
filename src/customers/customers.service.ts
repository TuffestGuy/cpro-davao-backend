import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UpdateCustomerDto } from './dto/update-customer.dto';

const prisma = new PrismaClient();

@Injectable()
export class CustomersService {

  async update(id: string, dto: UpdateCustomerDto) {
    return await prisma.customers.update({
      where: { id },
      data: dto,
    });
  }

  async create(createCustomerDto: any) {
    return await prisma.customers.create({
      data: {
        name: createCustomerDto.name,
        phone: createCustomerDto.phone,
        email: createCustomerDto.email,
        vehicle: createCustomerDto.vehicle,
        status: createCustomerDto.status || 'Active',
      },
    });
  }

  async findByEmail(email: string) {
  return await prisma.customers.findFirst({
    where: { email },
  });
}

  async findAll() {
    return await prisma.customers.findMany({
      orderBy: { created_at: 'desc' }
    });
  }
}