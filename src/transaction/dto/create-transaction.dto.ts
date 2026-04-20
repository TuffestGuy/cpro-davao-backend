import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum TransactionType {
  Income = 'income',
  Expense = 'expense',
}

export enum TransactionCategory {
  Service = 'Service',
  Payroll = 'Payroll',
  Inventory = 'Inventory',
  Other = 'Other',
}

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  type!: TransactionType;

  @IsEnum(TransactionCategory)
  category!: TransactionCategory;

  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than zero' })
  @Type(() => Number)
  amount!: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  date?: string | Date;
}