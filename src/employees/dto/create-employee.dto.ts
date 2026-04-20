import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
  Max,
  MinLength,
  MaxLength,
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
 
export enum Performance {
  Excellent = 'Excellent',
  Good      = 'Good',
  Average   = 'Average',
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
  @Min(0,          { message: 'Salary cannot be negative' })
  @Max(10_000_000, { message: 'Salary exceeds the allowed maximum' })
  @Type(() => Number)   // coerce "50000" string → 50000 number
  salary!: number;
 
  @IsEnum(EmpStatus)
  @IsOptional()
  status?: EmpStatus = EmpStatus.Active;
 
  @IsEnum(Performance)
  @IsOptional()
  performance?: Performance = Performance.Good;
}