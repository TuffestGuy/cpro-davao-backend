import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class AppointmentsService {

  // CREATE
  async create(dto: any) {
    return await prisma.appointments.create({
      data: {
        customer_id:    dto.customer_id,
        service_type:   dto.service_type,
        scheduled_date: (() => {
        const d = new Date(dto.scheduled_date);
        if (isNaN(d.getTime())) throw new BadRequestException("Invalid scheduled_date");
         return d;
})(),
        total_cost:     dto.total_cost,
        status:         'Pending',
      },
      include: { customer: true },
    });
  }

  // GET ALL
  async findAll() {
    return await prisma.appointments.findMany({
      include:  { customer: true },
      orderBy:  { scheduled_date: 'asc' },
    });
  }

  // GET ONE
  async findOne(id: string) {
    const appointment = await prisma.appointments.findUnique({
      where:   { id },
      include: { customer: true },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment ${id} not found`);
    }

    return appointment;
  }

  // UPDATE STATUS ONLY (for "Mark as Complete" button)
  async updateStatus(id: string, status: string) {
    const valid = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

    if (!valid.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    return await prisma.appointments.update({
      where:   { id },
      data:    { status },
      include: { customer: true },
    });
  }

  // UPDATE FULL APPOINTMENT
  async update(id: string, dto: any) {
    // Check it exists first
    await this.findOne(id);

    // Only update fields that were actually sent
    const data: any = {};
    if (dto.customer_id)    data.customer_id    = dto.customer_id;
    if (dto.service_type)   data.service_type   = dto.service_type;
    if (dto.scheduled_date) data.scheduled_date = new Date(dto.scheduled_date);
    if (dto.total_cost)     data.total_cost     = dto.total_cost;
    if (dto.status)         data.status         = dto.status;

    return await prisma.appointments.update({
      where:   { id },
      data,
      include: { customer: true },
    });
  }

  // DELETE
  async remove(id: string) {
    // Check it exists first
    await this.findOne(id);

    await prisma.appointments.delete({ where: { id } });

    return { message: 'Appointment deleted successfully' };
  }
}