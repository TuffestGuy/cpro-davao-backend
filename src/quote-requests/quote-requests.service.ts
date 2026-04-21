// src/quote-requests/quote-requests.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuoteRequestDto } from './dto/create-quote-request.dto';
import { Resend } from 'resend';

// Human-readable labels for the Select values coming from QuoteForm.tsx
const SERVICE_LABELS: Record<string, string> = {
  ceramic:    'Ceramic Coating',
  ppf:        'Paint Protection Film (PPF)',
  detailing:  'Interior & Exterior Detailing',
  maintenance:'Maintenance Package',
  combo:      'Combo Package',
};

const SIZE_LABELS: Record<string, string> = {
  small: 'Small (Sedan/Hatchback)',
  suv:   'Medium (SUV/Crossover)',
  large: 'Large (Full-Size SUV/Van)',
};

@Injectable()
export class QuoteRequestsService {
  // Resend is instantiated once per service instance
  private resend = new Resend(process.env.RESEND_API_KEY);

  // PrismaService is injected — no `new PrismaClient()` here
  constructor(private readonly prisma: PrismaService) {}

  // ── CREATE ────────────────────────────────────────────────────────────────
  async create(dto: CreateQuoteRequestDto) {
    // Step 1: Save to database first
    // If this fails, we don't send the email — no phantom notifications
    let quote: any;
    try {
      quote = await this.prisma.quote_requests.create({
        data: {
          name:    dto.name.trim(),
          contact: dto.contact.trim(),
          vehicle: dto.vehicle.trim(),
          service: dto.service,
          size:    dto.size,
          notes:   dto.notes?.trim() ?? null,
          status:  'pending',
        },
      });
    } catch (err) {
      console.error('Failed to save quote request to DB:', err);
      throw new InternalServerErrorException('Could not save quote request.');
    }

    // Step 2: Send email notification to shop
    // We wrap this in try/catch separately — a failed email should NOT
    // cause the API to return an error if the DB save succeeded.
    try {
      const serviceLabel = SERVICE_LABELS[dto.service] ?? dto.service;
      const sizeLabel    = SIZE_LABELS[dto.size]       ?? dto.size;

      await this.resend.emails.send({
        // Until you verify a domain on resend.com, you MUST use this from address
        // After domain verification, change to: 'Ceramic Pro Davao <noreply@yourdomain.com>'
        from:    'Ceramic Pro Davao <onboarding@resend.dev>',
        to:      process.env.SHOP_EMAIL!,
        subject: `🔔 New Quote Request from ${dto.name}`,
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden;">
                
                <!-- Header -->
                <div style="background: #E41E6A; padding: 24px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">New Quote Request</h1>
                  <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0 0;">
                    Submitted on ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}
                  </p>
                </div>

                <!-- Body -->
                <div style="padding: 28px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #eee;">
                      <td style="padding: 12px 8px; font-weight: bold; color: #555; width: 40%;">Full Name</td>
                      <td style="padding: 12px 8px; color: #111;">${dto.name}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee; background: #fafafa;">
                      <td style="padding: 12px 8px; font-weight: bold; color: #555;">Contact Number</td>
                      <td style="padding: 12px 8px; color: #111;">${dto.contact}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                      <td style="padding: 12px 8px; font-weight: bold; color: #555;">Vehicle</td>
                      <td style="padding: 12px 8px; color: #111;">${dto.vehicle}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee; background: #fafafa;">
                      <td style="padding: 12px 8px; font-weight: bold; color: #555;">Service</td>
                      <td style="padding: 12px 8px; color: #111;">${serviceLabel}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                      <td style="padding: 12px 8px; font-weight: bold; color: #555;">Vehicle Size</td>
                      <td style="padding: 12px 8px; color: #111;">${sizeLabel}</td>
                    </tr>
                    <tr style="background: #fafafa;">
                      <td style="padding: 12px 8px; font-weight: bold; color: #555;">Notes</td>
                      <td style="padding: 12px 8px; color: #111;">${dto.notes ?? '<em style="color: #aaa;">None</em>'}</td>
                    </tr>
                  </table>

                  <div style="margin-top: 24px; padding: 16px; background: #fff8f0; border-left: 4px solid #E41E6A; border-radius: 4px;">
                    <p style="margin: 0; color: #555; font-size: 14px;">
                      Log in to your admin dashboard to view and manage this quote request.
                    </p>
                  </div>
                </div>

                <!-- Footer -->
                <div style="background: #111; padding: 16px; text-align: center;">
                  <p style="color: #666; font-size: 12px; margin: 0;">
                    Ceramic Pro Davao — Admin Notification System
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
    } catch (emailErr) {
      // Log the email failure but still return the saved quote to the frontend
      // The customer still gets their success message; you just don't get the email
      console.error('Email send failed (quote was still saved):', emailErr);
    }

    return quote;
  }

  // ── READ ALL ──────────────────────────────────────────────────────────────
  async findAll() {
    return this.prisma.quote_requests.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  // ── UPDATE STATUS ─────────────────────────────────────────────────────────
  // Used by the admin dashboard to mark quotes as contacted/closed
  async updateStatus(id: string, status: string) {
    return this.prisma.quote_requests.update({
      where: { id },
      data:  { status },
    });
  }
}