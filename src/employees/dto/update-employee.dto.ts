import { PartialType }                  from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CreateEmployeeDto }            from './create-employee.dto';

export { Department, EmpStatus } from './create-employee.dto';

export enum Availability {
  Available = 'Available',
  Busy      = 'Busy',
}

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  @IsEnum(Availability)
  @IsOptional()
  availability?: Availability;

  @IsString()
  @IsOptional()
  current_assignment?: string;
}