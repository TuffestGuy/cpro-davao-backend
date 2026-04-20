import { IsString, IsOptional } from 'class-validator';

export class UpdateShopSettingDto {
  @IsString() @IsOptional() business_name?: string;
  @IsString() @IsOptional() contact_number?: string;
  @IsString() @IsOptional() email?: string;
  @IsString() @IsOptional() website?: string;
  @IsString() @IsOptional() address?: string;
}