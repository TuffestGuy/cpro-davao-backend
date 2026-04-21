import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  CreateAppointmentDto,
  PaymentMethod,
  PaymentType,
} from './dto/create-appointment.dto';

const prisma = new PrismaClient();

export const ALLOWED_STATUSES = [
  'Pending Verification',
  'Confirmed',
  'Rejected',
  'Completed',
  'Cancelled',
  'In Progress',
] as const;

const WITH_CUSTOMER = { customer: true } as const;

@Injectable()
export class AppointmentsService {

  // ── CREATE (customer — requires proof file) ───────────────
  async create(dto: CreateAppointmentDto, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Proof of payment file is required');
    }

    const appointmentDate = new Date(dto.date);
    appointmentDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDate < today) {
      throw new BadRequestException('Appointment date cannot be in the past');
    }

    const scheduledDate = new Date(`${dto.date}T${dto.time}`);
    if (isNaN(scheduledDate.getTime())) {
      throw new BadRequestException('Invalid date or time value');
    }

    const totalAmount      = Number(dto.totalAmount);
    const deposit          = Number(dto.deposit);
    const remainingBalance = Number(dto.remainingBalance);

    if (dto.paymentType === PaymentType.FULL_PAYMENT) {
      if (Math.abs(deposit - totalAmount) > 0.01) {
        throw new BadRequestException('For Full Payment: deposit must equal totalAmount');
      }
      if (Math.abs(remainingBalance) > 0.01) {
        throw new BadRequestException('For Full Payment: remainingBalance must be 0');
      }
    }

    if (dto.paymentType === PaymentType.DOWN_PAYMENT) {
      if (deposit >= totalAmount) {
        throw new BadRequestException('For Down Payment: deposit must be less than totalAmount');
      }
      const expected = totalAmount - deposit;
      if (Math.abs(remainingBalance - expected) > 0.01) {
        throw new BadRequestException('For Down Payment: remainingBalance must equal totalAmount - deposit');
      }
    }

    let addons = dto.addons ?? [];
    if (typeof addons === 'string') {
      try { addons = JSON.parse(addons); } catch { addons = []; }
    }

    const proofPath = file.path.replace(/\\/g, '/');

    return await prisma.appointments.create({
      data: {
        customer_id:          dto.customerId,
        service_type:         dto.service,
        scheduled_date:       scheduledDate,
        total_cost:           totalAmount,
        status:               'Pending Verification',
        full_name:            dto.fullName,
        mobile_number:        dto.mobileNumber,
        addons,
        vehicle_make:         dto.vehicleMake,
        vehicle_model:        dto.vehicleModel,
        vehicle_year:         Number(dto.vehicleYear),
        vehicle_class:        dto.vehicleClass,
        vehicle_plate_number: dto.vehiclePlateNumber,
        appointment_time:     dto.time,
        payment_method:       dto.paymentMethod,
        payment_type:         dto.paymentType,
        proof_of_payment:     proofPath,
        total_amount:         totalAmount,
        deposit,
        remaining_balance:    remainingBalance,
        notes:                dto.notes ?? null,
      },
      include: WITH_CUSTOMER,
    });
  }

  // ── CREATE ADMIN (no proof required — auto Confirmed) ─────
  async createAdmin(dto: any) {
    return await prisma.appointments.create({
      data: {
        customer_id:    dto.customer_id,
        service_type:   dto.service_type,
        scheduled_date: new Date(dto.scheduled_date),
        total_cost:     dto.total_cost ?? 0,
        status:         'Confirmed',
      },
      include: WITH_CUSTOMER,
    });
  }

  // ── GET ALL (admin) ───────────────────────────────────────
  async findAll() {
    return await prisma.appointments.findMany({
      include: WITH_CUSTOMER,
      orderBy: { scheduled_date: 'asc' },
    });
  }

  // ── GET PENDING VERIFICATION QUEUE ────────────────────────
  async findPendingVerification() {
    return await prisma.appointments.findMany({
      where:   { status: 'Pending Verification' },
      include: WITH_CUSTOMER,
      orderBy: { created_at: 'asc' },
    });
  }

  // ── GET BY CUSTOMER ───────────────────────────────────────
  async findByCustomer(customerId: string) {
    return await prisma.appointments.findMany({
      where:   { customer_id: customerId },
      include: WITH_CUSTOMER,
      orderBy: { scheduled_date: 'desc' },
    });
  }

  // ── GET ONE ───────────────────────────────────────────────
  async findOne(id: string) {
    const appointment = await prisma.appointments.findUnique({
      where:   { id },
      include: WITH_CUSTOMER,
    });
    if (!appointment) {
      throw new NotFoundException(`Appointment ${id} not found`);
    }
    return appointment;
  }

  // ── ADMIN: APPROVE ────────────────────────────────────────
  async approveBooking(id: string, remarks?: string) {
    const appt = await this.findOne(id);
    if (appt.status !== 'Pending Verification') {
      throw new BadRequestException(
        `Cannot approve a booking with status "${appt.status}"`,
      );
    }
    return await prisma.appointments.update({
      where: { id },
      data:  { status: 'Confirmed', admin_remarks: remarks ?? null },
      include: WITH_CUSTOMER,
    });
  }

  // ── ADMIN: REJECT ─────────────────────────────────────────
  async rejectBooking(id: string, remarks?: string) {
    const appt = await this.findOne(id);
    if (appt.status !== 'Pending Verification') {
      throw new BadRequestException(
        `Cannot reject a booking with status "${appt.status}"`,
      );
    }
    return await prisma.appointments.update({
      where: { id },
      data:  { status: 'Rejected', admin_remarks: remarks ?? null },
      include: WITH_CUSTOMER,
    });
  }

  // ── UPDATE STATUS ─────────────────────────────────────────
  async updateStatus(id: string, status: string) {
    if (!ALLOWED_STATUSES.includes(status as any)) {
      throw new BadRequestException(
        `Invalid status "${status}". Allowed: ${ALLOWED_STATUSES.join(', ')}`,
      );
    }
    return await prisma.appointments.update({
      where:   { id },
      data:    { status },
      include: WITH_CUSTOMER,
    });
  }

  // ── FULL UPDATE ───────────────────────────────────────────
  async update(id: string, dto: any) {
    await this.findOne(id);
    const data: any = {};
    if (dto.customer_id    !== undefined) data.customer_id    = dto.customer_id;
    if (dto.service_type   !== undefined) data.service_type   = dto.service_type;
    if (dto.scheduled_date !== undefined) data.scheduled_date = new Date(dto.scheduled_date);
    if (dto.total_cost     !== undefined) data.total_cost     = dto.total_cost;
    if (dto.status         !== undefined) data.status         = dto.status;
    if (dto.notes          !== undefined) data.notes          = dto.notes;
    if (dto.admin_remarks  !== undefined) data.admin_remarks  = dto.admin_remarks;
    if (dto.assigned_staff !== undefined) data.assigned_staff = dto.assigned_staff;
    if (dto.employee_id    !== undefined) data.employee_id    = dto.employee_id;
    return await prisma.appointments.update({
      where:   { id },
      data,
      include: WITH_CUSTOMER,
    });
  }

  // ── DELETE ────────────────────────────────────────────────
  async remove(id: string) {
    await this.findOne(id);
    await prisma.appointments.delete({ where: { id } });
    return { message: 'Appointment deleted successfully' };
  }
}
