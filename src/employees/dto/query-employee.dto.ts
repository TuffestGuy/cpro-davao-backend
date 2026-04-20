import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Department, EmpStatus, Performance } from './create-employee.dto';

export class QueryEmployeeDto {
  @IsOptional()
  @IsString()
  search?: string; // searches name and position

  @IsOptional()
  @IsEnum(Department)
  department?: Department;

  @IsOptional()
  @IsEnum(EmpStatus)
  status?: EmpStatus;

  @IsOptional()
  @IsEnum(Performance)
  performance?: Performance;

  @IsOptional()
  @IsEnum(['name', 'created_at', 'salary', 'department'])
  sortBy?: string = 'name';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}