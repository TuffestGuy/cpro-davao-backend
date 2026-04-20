import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateJobOrderDto } from './create-job-order.dto';

export class UpdateJobOrderDto extends PartialType(CreateJobOrderDto) {
  @IsOptional()
  @IsEnum(['Pending', 'In Progress', 'Completed', 'Cancelled'], {
    message: 'Status must be: Pending, In Progress, Completed, or Cancelled',
  })
  status?: string;
}
