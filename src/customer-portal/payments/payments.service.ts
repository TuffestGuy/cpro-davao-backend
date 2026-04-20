import { Injectable } from '@nestjs/common';
import { PrismaService }    from '../../../prisma/prisma.service';
import { CreatePaymentDto } from '../dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  // GET /payments
  async findAll(customerId: string) {
    return await this.prisma.payments.findMany({
      where:   { customer_id: customerId },
      orderBy: { created_at: 'desc' },
      include: { appointment: true },
    });
  }

  // POST /payments
  async create(customerId: string, dto: CreatePaymentDto) {
    return await this.prisma.payments.create({
      data: {
        customer_id:    customerId,
        appointment_id: dto.appointment_id,
        amount:         dto.amount,
        payment_method: dto.payment_method ?? 'cash',
        status:         'paid',
      },
    });
  }
}