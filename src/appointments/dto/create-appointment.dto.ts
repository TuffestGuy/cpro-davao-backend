import {
  IsString, IsNotEmpty, IsOptional,
  IsEnum, IsInt, Min, Max, IsNumber, Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum PaymentMethod {
  BANK_TRANSFER = 'Bank Transfer',
  QR_PAYMENT    = 'QR Payment',
}

export enum PaymentType {
  FULL_PAYMENT = 'Full Payment',
  DOWN_PAYMENT = 'Down Payment',
}

export class CreateAppointmentDto {
  // ── Customer ──────────────────────────────────────────────
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9+\-\s()]{7,20}$/, { message: 'Invalid mobile number format' })
  mobileNumber: string;

  // ── Service ───────────────────────────────────────────────
  @IsString()
  @IsNotEmpty()
  service: string;

  // addons arrives as a JSON string in multipart; parsed in service
  @IsOptional()
  addons?: any;

  // ── Vehicle ───────────────────────────────────────────────
  @IsString()
  @IsNotEmpty()
  vehicleMake: string;

  @IsString()
  @IsNotEmpty()
  vehicleModel: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 2)
  vehicleYear: number;

  @IsString()
  @IsNotEmpty()
  vehicleClass: string;

  @IsString()
  @IsNotEmpty()
  vehiclePlateNumber: string;

  // ── Schedule ──────────────────────────────────────────────
  @IsString()
  @IsNotEmpty()
  date: string;   // expected format: YYYY-MM-DD

  @IsString()
  @IsNotEmpty()
  time: string;   // expected format: HH:mm

  // ── Payment ───────────────────────────────────────────────
  @IsEnum(PaymentMethod, {
    message: `paymentMethod must be one of: ${Object.values(PaymentMethod).join(', ')}`,
  })
  paymentMethod: PaymentMethod;

  @IsEnum(PaymentType, {
    message: `paymentType must be one of: ${Object.values(PaymentType).join(', ')}`,
  })
  paymentType: PaymentType;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  totalAmount: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  deposit: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  remainingBalance: number;

  // ── Optional ──────────────────────────────────────────────
  @IsOptional()
  @IsString()
  notes?: string;
}