import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UpdateCustomerDto } from './dto/update-customer.dto';

const prisma = new PrismaClient();

@Injectable()
export class CustomersService {

  async findAll() {
    return await prisma.customers.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const customer = await prisma.customers.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);
    return customer;
  }

  async findByEmail(email: string) {
    try {
      return await prisma.customers.findFirst({ where: { email } });
    } catch (err) {
      console.error('findByEmail error:', err);
      return null;
    }
  }

  async create(createCustomerDto: any) {
    return await prisma.customers.create({
      data: {
        name:    createCustomerDto.name,
        phone:   createCustomerDto.phone   || createCustomerDto.contact || null,
        contact: createCustomerDto.contact || createCustomerDto.phone   || null,
        email:   createCustomerDto.email   || null,
        vehicle: createCustomerDto.vehicle || null,
        status:  createCustomerDto.status  || 'Active',
      },
    });
  }

  async update(id: string, dto: any) {
    await this.findOne(id);

    // Build update data — strip empty strings so validators never choke
    const data: any = {};

    if (dto.name    !== undefined && dto.name    !== '') data.name    = dto.name;
    if (dto.vehicle !== undefined && dto.vehicle !== '') data.vehicle = dto.vehicle;
    if (dto.status  !== undefined && dto.status  !== '') data.status  = dto.status;

    // contact / phone — keep both columns in sync
    const contact = dto.contact ?? dto.phone;
    if (contact !== undefined && contact !== '') {
      data.contact = contact;
      data.phone   = contact;
    }

    // email — only set if it's a real non-empty value, otherwise set null
    if (dto.email !== undefined) {
      data.email = dto.email && dto.email.trim() !== '' ? dto.email.trim() : null;
    }

    // last_service / total_spent
    if (dto.last_service !== undefined) data.last_service = dto.last_service || null;
    if (dto.total_spent  !== undefined) data.total_spent  = dto.total_spent;

    return await prisma.customers.update({
      where: { id },
      data,
    });
  }
}
