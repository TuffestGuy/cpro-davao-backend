import { Controller, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { SettingsService }    from './settings.service';
import { JwtAuthGuard }       from '../../auth/jwt-auth.guard';
import { UpdatePasswordDto, UpdateProfileDto } from '../dto';

@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private svc: SettingsService) {}

  // PATCH /settings/profile
  @Patch('profile')
  updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.svc.updateProfile(req.user.id, dto);
  }

  // PATCH /settings/password
  @Patch('password')
  updatePassword(@Request() req: any, @Body() dto: UpdatePasswordDto) {
    return this.svc.updatePassword(req.user.id, dto);
  }
}