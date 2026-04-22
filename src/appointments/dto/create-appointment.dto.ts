import {
  IsString, IsNotEmpty, IsOptional,
  IsEnum, IsNumber, Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum PaymentMethod {
  BANK_TRANSFER = 'Bank Transfer',
  QR_PAYMENT    = 'QR Payment',
  CASH          = 'Cash', // <-- Added Cash to the VIP list!
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
  @IsOptional() 
  fullName?: string;

  @IsString()
  @IsOptional() // Front desk might not provide this initially
  mobileNumber?: string;

  // ── Service ───────────────────────────────────────────────
  @IsString()
  @IsNotEmpty()
  service: string;

  @IsOptional()
  addons?: any;

  // ── Vehicle ───────────────────────────────────────────────
  @IsString()
  @IsOptional() // Made optional for Front Desk
  vehicleMake?: string;

  @IsString()
  @IsOptional()
  vehicleModel?: string;

  @IsString()
  @IsOptional() // Changed to String to match Prisma Schema!
  vehicleYear?: string;

  @IsString()
  @IsOptional()
  vehicleClass?: string;

  @IsString()
  @IsOptional()
  vehiclePlateNumber?: string;

  // ── Schedule ──────────────────────────────────────────────
  @IsString()
  @IsNotEmpty()
  date: string;   

  @IsString()
  @IsNotEmpty()
  time: string;   

  // ── Payment ───────────────────────────────────────────────
  @IsEnum(PaymentMethod, {
    message: `paymentMethod must be one of: ${Object.values(PaymentMethod).join(', ')}`,
  })
  @IsOptional() // Made optional for flexible booking
  paymentMethod?: PaymentMethod;

  @IsEnum(PaymentType, {
    message: `paymentType must be one of: ${Object.values(PaymentType).join(', ')}`,
  })
  @IsOptional()
  paymentType?: PaymentType;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsOptional()
  deposit?: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsOptional()
  remainingBalance?: number;

  // ── Optional ──────────────────────────────────────────────
  @IsOptional()
  @IsString()
  notes?: string;
}