import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { HistoryService } from './history.service';
import { JwtAuthGuard }   from '../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('history')
export class HistoryController {
  constructor(private svc: HistoryService) {}

  // GET /history
  @Get()
  findAll(@Request() req: any) {
    return this.svc.findAll(req.user.id);
  }
}