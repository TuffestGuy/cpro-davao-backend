import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { createClient } from '@supabase/supabase-js';
import * as fs   from 'fs';
import * as path from 'path';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── PRIVATE: Upload proof file to Supabase Storage ──────────────────────
  private async uploadProofToSupabase(
    localFilePath: string,
    fileName:      string,
  ): Promise<string> {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const fileBuffer  = fs.readFileSync(localFilePath);
    const storagePath = `payments/${fileName}`;

    // Detect content type from extension
    const ext = path.extname(fileName).toLowerCase();
    const contentType =
      ext === '.pdf'  ? 'application/pdf' :
      ext === '.png'  ? 'image/png'       :
      ext === '.webp' ? 'image/webp'      :
      'image/jpeg';

    const { error } = await supabase.storage
      .from('proofs')
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) throw new Error(`Supabase upload failed: ${error.message}`);

    // Get public URL
    const { data } = supabase.storage
      .from('proofs')
      .getPublicUrl(storagePath);

    // Delete local file after successful upload
    try { fs.unlinkSync(localFilePath); } catch {}

    return data.publicUrl;
  }

  // ── GET ALL ───────────────────────────────────────────────────────────────
  async findAll(status?: string) {
    return await this.prisma.appointments.findMany({
      where:   status ? { status } : undefined,
      include: { customer: true },
      orderBy: { scheduled_date: 'desc' },
    });
  }

  // ── GET PENDING VERIFICATION QUEUE ────────────────────────────────────────
  async findPendingVerification() {
    return await this.prisma.appointments.findMany({
      where:   { status: 'Pending Verification' },
      include: { customer: true },
      orderBy: { created_at: 'asc' },
    });
  }

  // ── GET BY CUSTOMER ───────────────────────────────────────────────────────
  async findByCustomer(customerId: string) {
    return await this.prisma.appointments.findMany({
      where:   { customer_id: customerId },
      include: { customer: true },
      orderBy: { scheduled_date: 'desc' },
    });
  }

  // ── GET ONE ───────────────────────────────────────────────────────────────
  async findOne(id: string) {
    const appt = await this.prisma.appointments.findUnique({
      where:   { id },
      include: { customer: true },
    });
    if (!appt) throw new NotFoundException(`Appointment ${id} not found`);
    return appt;
  }

  // ── CREATE ────────────────────────────────────────────────────────────────
  async create(dto: any, localProofPath?: string) {
    console.log('RAW DTO:', JSON.stringify(dto, null, 2));
    console.log('localProofPath:', localProofPath);

    try {
      const scheduledDate = new Date(`${dto.date}T${dto.time}`);

      // Validate vehicle_year — only accept 4-digit years
      const rawYear   = String(dto.vehicleYear ?? '');
      const validYear = /^\d{4}$/.test(rawYear) ? rawYear : '';

      // ── Upload proof to Supabase Storage ──
      let proofUrl = '';
      if (localProofPath) {
        const absolutePath = path.join(process.cwd(), localProofPath);
        const fileName     = path.basename(absolutePath);
        try {
          proofUrl = await this.uploadProofToSupabase(absolutePath, fileName);
          console.log('Proof uploaded to Supabase:', proofUrl);
        } catch (uploadErr) {
          console.error('Proof upload failed:', uploadErr);
          // Don't block appointment creation if upload fails
          proofUrl = localProofPath;
        }
      }

      return await this.prisma.appointments.create({
        data: {
          customer_id:       dto.customerId,
          service_type:      dto.service,
          scheduled_date:    scheduledDate,
          total_cost:        Number(dto.totalAmount)      || 0,
          deposit:           Number(dto.deposit)          || 0,
          remaining_balance: Number(dto.remainingBalance) || 0,
          status:            'Pending Verification',
          notes:             String(dto.notes             ?? ''),
          full_name:         String(dto.fullName          ?? ''),
          mobile_number:     String(dto.mobileNumber      ?? ''),
          vehicle_make:      String(dto.vehicleMake        ?? ''),
          vehicle_model:     String(dto.vehicleModel       ?? ''),
          vehicle_year:      validYear,
          vehicle_class:     String(dto.vehicleClass       ?? ''),
          vehicle_plate:     String(dto.vehiclePlateNumber ?? ''),
          payment_method:    String(dto.paymentMethod      ?? ''),
          payment_type:      String(dto.paymentType        ?? ''),
          addons:            dto.addons ? JSON.stringify(dto.addons) : '[]',
          proof_url:         proofUrl,   // ← Supabase public URL
        },
        include: { customer: true },
      });
    } catch (err) {
      console.error('Create appointment error:', err);
      throw err;
    }
  }

  // ── UPDATE STATUS ─────────────────────────────────────────────────────────
  async updateStatus(id: string, status: string) {
    await this.findOne(id);
    return await this.prisma.appointments.update({
      where:   { id },
      data:    { status },
      include: { customer: true },
    });
  }

  // ── APPROVE ───────────────────────────────────────────────────────────────
  async approve(id: string, approvedBy: string, remarks?: string) {
    await this.findOne(id);
    return await this.prisma.appointments.update({
      where: { id },
      data: {
        status:      'Confirmed',
        approved_by: approvedBy,
        approved_at: new Date(),
        ...(remarks ? { notes: `[Approved] ${remarks}` } : {}),
      },
      include: { customer: true },
    });
  }

  // ── REJECT ────────────────────────────────────────────────────────────────
  async reject(id: string, rejectedBy: string, reason?: string) {
    await this.findOne(id);
    return await this.prisma.appointments.update({
      where: { id },
      data: {
        status:           'Rejected',
        rejected_by:      rejectedBy,
        rejected_at:      new Date(),
        rejection_reason: reason ?? '',
      },
      include: { customer: true },
    });
  }

  // ── FULL UPDATE ───────────────────────────────────────────────────────────
  async update(id: string, dto: any) {
    await this.findOne(id);
    const data: any = {};
    if (dto.customer_id    !== undefined) data.customer_id    = dto.customer_id;
    if (dto.service_type   !== undefined) data.service_type   = dto.service_type;
    if (dto.scheduled_date !== undefined) data.scheduled_date = new Date(dto.scheduled_date);
    if (dto.total_cost     !== undefined) data.total_cost     = dto.total_cost;
    if (dto.status         !== undefined) data.status         = dto.status;
    if (dto.notes          !== undefined) data.notes          = dto.notes;
    if (dto.assigned_staff !== undefined) data.assigned_staff = dto.assigned_staff;
    if (dto.employee_id    !== undefined) data.employee_id    = dto.employee_id;

    return await this.prisma.appointments.update({
      where:   { id },
      data,
      include: { customer: true },
    });
  }

  // ── DELETE ────────────────────────────────────────────────────────────────
  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.appointments.delete({ where: { id } });
    return { message: 'Appointment deleted successfully' };
  }
}