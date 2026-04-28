import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryJobOrderDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['Pending', 'In Progress', 'Completed', 'Cancelled'])
  status?: string;

  @IsOptional()
  @IsEnum(['Normal', 'Urgent'])
  priority?: string;

  @IsOptional()
  @IsEnum(['created_at', 'scheduled_date', 'priority'])
  sortBy?: string = 'created_at';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: string = 'desc';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 100;
}
