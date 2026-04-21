import { Controller, Get, Param } from '@nestjs/common';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('by-email/:email')
  findByEmail(@Param('email') email: string) {
    return this.profilesService.findByEmail(email);
  }
}