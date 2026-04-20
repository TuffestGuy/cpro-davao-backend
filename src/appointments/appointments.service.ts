import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class AppointmentsService {
  
  // 1. Create a new Appointment linked to a Customer
  async create(createAppointmentDto: any) {
    return await prisma.appointments.create({
      data: {
        customer_id: createAppointmentDto.customer_id,
        service_type: createAppointmentDto.service_type,
        scheduled_date: new Date(createAppointmentDto.scheduled_date),
        total_cost: createAppointmentDto.total_cost,
        status: 'Pending',
      },
    });
  }

  // 2. Get all appointments with Customer details (The "Join" query)
  async findAll() {
    return await prisma.appointments.findMany({
      include: {
        customer: true, // This brings in the name/phone of the owner!
      },
      orderBy: { scheduled_date: 'asc' },
    });
  }
}