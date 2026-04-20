import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  // GET /history — completed appointments only
  async findAll(customerId: string) {
    return await this.prisma.appointments.findMany({
      where: {
        customer_id: customerId,
        status:      'Completed',
      },
      orderBy: { scheduled_date: 'desc' },
    });
  }
}