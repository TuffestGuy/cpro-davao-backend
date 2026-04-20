import {
  Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePortalAppointmentDto } from '../dto';

@Injectable()
export class PortalAppointmentsService {
  constructor(private prisma: PrismaService) {}

  // GET /appointments — only this customer's appointments
  async findAll(customerId: string, status?: string) {
    return await this.prisma.appointments.findMany({
      where: {
        customer_id: customerId,
        ...(status ? { status } : {}),
      },
      orderBy: { scheduled_date: 'desc' },
    });
  }

  // POST /appointments
  async create(customerId: string, dto: CreatePortalAppointmentDto) {
    return await this.prisma.appointments.create({
      data: {
        customer_id:    customerId,
        service_type:   dto.service,
        scheduled_date: new Date(dto.scheduled_date),
        total_cost:     dto.total_cost,
        status:         'Pending',
      },
    });
  }

  // PATCH /appointments/:id
  async update(customerId: string, id: string, dto: Partial<CreatePortalAppointmentDto>) {
    // Make sure this appointment belongs to this customer
    const existing = await this.prisma.appointments.findUnique({
      where: { id },
    });

    if (!existing)
      throw new NotFoundException('Appointment not found');

    if (existing.customer_id !== customerId)
      throw new ForbiddenException('You cannot edit this appointment');

    if (existing.status === 'Completed')
      throw new ForbiddenException('Cannot edit a completed appointment');

    return await this.prisma.appointments.update({
      where: { id },
      data: {
        ...(dto.service        && { service_type:   dto.service                   }),
        ...(dto.scheduled_date && { scheduled_date: new Date(dto.scheduled_date)  }),
        ...(dto.total_cost     && { total_cost:     dto.total_cost                }),
      },
    });
  }

  // DELETE /appointments/:id — cancel only
  async cancel(customerId: string, id: string) {
    const existing = await this.prisma.appointments.findUnique({
      where: { id },
    });

    if (!existing)
      throw new NotFoundException('Appointment not found');

    if (existing.customer_id !== customerId)
      throw new ForbiddenException('You cannot cancel this appointment');

    if (existing.status === 'Completed')
      throw new ForbiddenException('Cannot cancel a completed appointment');

    return await this.prisma.appointments.update({
      where: { id },
      data:  { status: 'Cancelled' },
    });
  }
}