import {
  IsString, IsOptional, IsEnum,
  IsNumber, Min, IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  @IsString() @IsOptional() name?:  string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() email?: string;
}

export enum AppointmentStatus {
  Pending    = 'Pending',
  InProgress = 'In Progress',
  Completed  = 'Completed',
  Cancelled  = 'Cancelled',
}

export class CreatePortalAppointmentDto {
  @IsString()               service:          string;
  @IsString() @IsOptional() vehicle?:         string;
  @IsString()               scheduled_date:   string; // ISO string from frontend

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  total_cost: number;
}

export class UpdatePasswordDto {
  @IsString() current_password: string;
  @IsString() new_password:     string;
}

export class CreatePaymentDto {
  @IsUUID()                 appointment_id:  string;
  @IsNumber() @Type(() => Number) amount:    number;
  @IsString() @IsOptional() payment_method?: string;
}