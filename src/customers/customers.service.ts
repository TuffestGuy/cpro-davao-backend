import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class CustomersService {
  
  // Create a new customer
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

  // Get all customers (newest first)
  async findAll() {
    return await prisma.customers.findMany({
      orderBy: { created_at: 'desc' }
    });
  }
}