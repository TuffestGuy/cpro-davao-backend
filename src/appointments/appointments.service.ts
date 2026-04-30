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

    const ext = path.extname(fileName).toLowerCase();
    const contentType =
      ext === '.pdf'  ? 'application/pdf' :
      ext === '.png'  ? 'image/png'       :
      ext === '.webp' ? 'image/webp'      :
      'image/jpeg';

    const { error } = await supabase.storage
      .from('proofs')
      .upload(storagePath, fileBuffer, { contentType, upsert: true });

    if (error) throw new Error(`Supabase upload failed: ${error.message}`);

    const { data } = supabase.storage.from('proofs').getPublicUrl(storagePath);
    try { fs.unlinkSync(localFilePath); } catch {}
    return data.publicUrl;
  }

  // ── PRIVATE: Send email via Resend ────────────────────────────────────────
  private async sendEmail(to: string, subject: string, html: string) {
    try {
      // Dynamic import so the app still boots if RESEND_API_KEY is not set yet
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: `Ceramic Pro Davao <${process.env.EMAIL_FROM ?? 'noreply@ceramicprodavao.com'}>`,
        to,
        subject,
        html,
      });
    } catch (err) {
      // Never block the main operation if email fails
      console.error('Email send failed:', err);
    }
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

  // ── GET PENDING REFUNDS (for admin badge count) ───────────────────────────
  async findPendingRefunds() {
    return await this.prisma.appointments.findMany({
      where:   { refund_status: 'Requested' },
      include: { customer: true },
      orderBy: { refund_requested_at: 'asc' },
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

    try {
      const scheduledDate = new Date(`${dto.date}T${dto.time}`);
      const rawYear       = String(dto.vehicleYear ?? '');
      const validYear     = /^\d{4}$/.test(rawYear) ? rawYear : '';

      let proofUrl = '';
      if (localProofPath) {
        const absolutePath = path.join(process.cwd(), localProofPath);
        const fileName     = path.basename(absolutePath);
        try {
          proofUrl = await this.uploadProofToSupabase(absolutePath, fileName);
        } catch (uploadErr) {
          console.error('Proof upload failed:', uploadErr);
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
          proof_url:         proofUrl,
          refund_status:     'None',
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

  // ══════════════════════════════════════════════════════════════════════════
  //  REFUND FLOW
  // ══════════════════════════════════════════════════════════════════════════

  // ── 1. REQUEST REFUND (customer requests) ─────────────────────────────────
  async requestRefund(id: string, amount: number) {
    const appt = await this.findOne(id);
    if ((appt as any).refund_status && (appt as any).refund_status !== 'None') {
      throw new BadRequestException('A refund request already exists for this appointment.');
    }
    return await this.prisma.appointments.update({
      where: { id },
      data: {
        refund_status:       'Requested',
        refund_amount:       amount || (appt as any).deposit || 0,
        refund_requested_at: new Date(),
      },
      include: { customer: true },
    });
  }

  // ── 2. CONFIRM REFUND (admin approves + sends email) ─────────────────────
  async confirmRefund(id: string, amount: number) {
    const appt    = await this.findOne(id);
    const updated = await this.prisma.appointments.update({
      where: { id },
      data: {
        refund_status: 'Approved',
        refund_amount: amount || (appt as any).deposit || 0,
      },
      include: { customer: true },
    });

    const customerEmail = (updated as any).customer?.email;
    const customerName  = (updated as any).customer?.name ?? 'Customer';
    const refundAmount  = Number((updated as any).refund_amount ?? 0);
    const frontendUrl   = process.env.FRONTEND_URL ?? 'https://cprodavao.com';

    if (customerEmail) {
      await this.sendEmail(
        customerEmail,
        '✅ Your Refund Has Been Approved — Action Required',
        `
        <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 36px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 28px;">
            <div style="background: linear-gradient(135deg, #E41E6A, #f43f8e); width: 56px; height: 56px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 12px;">✓</div>
            <h1 style="color: #E41E6A; margin: 0; font-size: 22px;">Refund Approved</h1>
            <p style="color: #666; margin: 6px 0 0; font-size: 13px;">Ceramic Pro Davao</p>
          </div>

          <p style="color: #ccc; line-height: 1.6;">Hi <strong style="color: #fff;">${customerName}</strong>,</p>
          <p style="color: #ccc; line-height: 1.6;">
            Great news! Your refund request of
            <strong style="color: #E41E6A; font-size: 18px;"> ₱${refundAmount.toLocaleString()}</strong>
            has been <strong style="color: #4ade80;">approved</strong>.
          </p>

          <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="color: #999; font-size: 13px; margin: 0 0 8px;">To receive your refund, please:</p>
            <ol style="color: #ccc; font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
              <li>Log in to your account at the link below</li>
              <li>Go to <strong style="color: #fff;">My Appointments</strong></li>
              <li>Find this appointment and click <strong style="color: #E41E6A;">Submit Refund Details</strong></li>
              <li>Enter your GCash number or bank account info</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${frontendUrl}/customer"
              style="background: linear-gradient(135deg, #E41E6A, #f43f8e); color: #fff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 15px rgba(228,30,106,0.4);">
              Submit My Refund Details →
            </a>
          </div>

          <p style="color: #666; font-size: 13px; text-align: center;">
            Once we receive your details, we will process the transfer within 1–3 business days.
          </p>

          <hr style="border: none; border-top: 1px solid #222; margin: 28px 0;" />
          <p style="color: #444; font-size: 12px; text-align: center; margin: 0;">
            Ceramic Pro Davao · Davao City, Philippines<br/>
            If you did not request a refund, please contact us immediately.
          </p>
        </div>
        `,
      );
    }

    return updated;
  }

  // ── 3. SUBMIT REFUND DETAILS (customer fills in their account) ────────────
  async submitRefundDetails(id: string, dto: {
    method:      string;
    account:     string;
    accountName: string;
    note?:       string;
  }) {
    await this.findOne(id);
    return await this.prisma.appointments.update({
      where: { id },
      data: {
        refund_status:       'Details Submitted',
        refund_method:       dto.method,
        refund_account:      dto.account,
        refund_account_name: dto.accountName,
        refund_note:         dto.note ?? '',
      },
      include: { customer: true },
    });
  }

  // ── 4. PROCESS REFUND (admin marks done + logs transaction) ───────────────
  async processRefund(id: string) {
    const appt    = await this.findOne(id);
    const updated = await this.prisma.appointments.update({
      where: { id },
      data: {
        refund_status:       'Processed',
        refund_processed_at: new Date(),
      },
      include: { customer: true },
    });

    // Log to transactions table as an expense
    const refundAmount = Number((appt as any).refund_amount ?? 0);
    const customerName = (appt as any).customer?.name ?? 'Unknown';
    const serviceType  = (appt as any).service_type ?? 'Service';

    if (refundAmount > 0) {
      try {
        await this.prisma.transaction.create({
          data: {
            type:        'expense',
            description: `Refund — ${customerName} — ${serviceType}`,
            amount:      refundAmount,
            category:    'Refund',
            date:        new Date(),
          },
        });
      } catch (txErr) {
        console.error('Transaction log failed:', txErr);
      }
    }

    // Notify customer that refund was processed
    const customerEmail = (updated as any).customer?.email;
    const customerName2 = (updated as any).customer?.name ?? 'Customer';

    if (customerEmail) {
      await this.sendEmail(
        customerEmail,
        '💸 Your Refund Has Been Processed',
        `
        <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 36px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 40px;">💸</div>
            <h1 style="color: #4ade80; margin: 8px 0; font-size: 22px;">Refund Processed!</h1>
          </div>
          <p style="color: #ccc;">Hi <strong style="color: #fff;">${customerName2}</strong>,</p>
          <p style="color: #ccc; line-height: 1.6;">
            Your refund of <strong style="color: #4ade80; font-size: 18px;">₱${refundAmount.toLocaleString()}</strong>
            has been transferred to your account. Please allow a few minutes for it to reflect.
          </p>
          <p style="color: #666; font-size: 13px;">Thank you for your patience. We hope to serve you again!</p>
          <hr style="border: none; border-top: 1px solid #222; margin: 24px 0;" />
          <p style="color: #444; font-size: 12px; text-align: center;">Ceramic Pro Davao · Davao City, Philippines</p>
        </div>
        `,
      );
    }

    return updated;
  }

  // ── 5. REJECT REFUND (admin rejects request) ──────────────────────────────
  async rejectRefund(id: string, reason?: string) {
    const appt = await this.findOne(id);
    const updated = await this.prisma.appointments.update({
      where: { id },
      data: {
        refund_status: 'Rejected',
        refund_note:   reason ?? '',
      },
      include: { customer: true },
    });

    // Notify customer of rejection
    const customerEmail = (updated as any).customer?.email;
    const customerName  = (updated as any).customer?.name ?? 'Customer';

    if (customerEmail) {
      await this.sendEmail(
        customerEmail,
        'Update on Your Refund Request',
        `
        <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 36px; border-radius: 16px;">
          <h1 style="color: #f87171; font-size: 20px;">Refund Request Update</h1>
          <p style="color: #ccc;">Hi <strong style="color: #fff;">${customerName}</strong>,</p>
          <p style="color: #ccc; line-height: 1.6;">
            We were unable to process your refund request at this time.
            ${reason ? `<br/><br/><strong>Reason:</strong> ${reason}` : ''}
          </p>
          <p style="color: #ccc;">Please contact us directly at our shop if you have questions.</p>
          <hr style="border: none; border-top: 1px solid #222; margin: 24px 0;" />
          <p style="color: #444; font-size: 12px; text-align: center;">Ceramic Pro Davao · Davao City, Philippines</p>
        </div>
        `,
      );
    }

    return updated;
  }
}
