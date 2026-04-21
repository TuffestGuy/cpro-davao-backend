import {
  IsString, IsNotEmpty, IsEnum, IsNumber,
  IsOptional, IsDateString, Min, Max,
  MinLength, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum Department {
  Technical  = 'Technical',
  Operations = 'Operations',
  Admin      = 'Admin',
  Sales      = 'Sales',
}

export enum EmpStatus {
  Active  = 'Active',
  OnLeave = 'On Leave',
}

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  position!: string;

  @IsEnum(Department, {
    message: `department must be one of: ${Object.values(Department).join(', ')}`,
  })
  department!: Department;

  @IsNumber()
  @Min(0,          { message: 'Salary cannot be negative'          })
  @Max(10_000_000, { message: 'Salary exceeds the allowed maximum' })
  @Type(() => Number)
  salary!: number;

  @IsEnum(EmpStatus)
  @IsOptional()
  status?: EmpStatus = EmpStatus.Active;

  // Performance removed — replaced by hire_date
  @IsDateString()
  @IsOptional()
  hire_date?: string;
}