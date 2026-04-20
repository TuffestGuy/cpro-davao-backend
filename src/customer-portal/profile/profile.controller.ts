import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ProfileService }  from './profile.service';
import { JwtAuthGuard }    from '../../auth/jwt-auth.guard';
import { UpdateProfileDto } from '../dto';

@UseGuards(JwtAuthGuard)   // All routes in this controller require JWT
@Controller('customer/profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  // GET /customer/profile
  @Get()
  getProfile(@Request() req: any) {
    return this.profileService.getProfile(req.user.id);
  }

  // PATCH /customer/profile
  @Patch()
  updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user.id, dto);
  }
}