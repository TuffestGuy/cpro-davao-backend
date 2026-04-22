import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateInventoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  category: string;

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
