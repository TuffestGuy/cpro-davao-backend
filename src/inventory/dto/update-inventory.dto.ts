import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateInventoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  stock?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  stockIn?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  stockOut?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  reorderLevel?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  price?: number;
}
