import { IsEnum } from 'class-validator';

export class UpdatePartRequestDto {
  @IsEnum(['Pending', 'Approved', 'Rejected'], {
    message: 'Status must be: Pending, Approved, or Rejected',
  })
  status: 'Pending' | 'Approved' | 'Rejected';
}