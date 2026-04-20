import { PartialType } from '@nestjs/mapped-types';  // npm install @nestjs/mapped-types
import { IsEnum, IsOptional, IsString } from 'class-validator';
 import { CreateEmployeeDto } from './create-employee.dto';
 
// Re-export so update-employee.dto.ts is self-contained in your project
export { Department, EmpStatus, Performance } from './create-employee.dto';
 
export enum Availability {
  Available = 'Available',
  Busy      = 'Busy',
}
 
// PartialType makes every field from CreateEmployeeDto optional,
// so PATCH can update just one field without requiring all of them.
export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  @IsEnum(Availability)
  @IsOptional()
  availability?: Availability;
 
  @IsString()
  @IsOptional()
  current_assignment?: string;
}