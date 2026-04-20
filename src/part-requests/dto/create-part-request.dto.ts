import {
  IsNotEmpty, IsString, IsInt, IsOptional,
  IsUUID, Min, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePartRequestDto {
  @IsOptional()
  @IsUUID()
  staff_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  staff_name?: string;

  @IsUUID()
  @IsNotEmpty()
  item_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  item_name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  category: string;

  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  unit: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  reason: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  job_ref?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
