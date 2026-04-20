import {
  IsString, IsNotEmpty, IsOptional, IsUUID,
  IsEnum, IsDateString, MaxLength,
} from 'class-validator';

export class CreateJobOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  customer: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  vehicle: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  service: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  assigned_staff: string;

  @IsOptional()
  @IsUUID()
  staff_id?: string;

  @IsDateString()
  scheduled_date: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  estimated_time?: string;

  @IsOptional()
  @IsEnum(['Normal', 'Urgent'])
  priority?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
