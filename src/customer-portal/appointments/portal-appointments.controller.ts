import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { PortalAppointmentsService }    from './portal-appointments.service';
import { JwtAuthGuard }                 from '../../auth/jwt-auth.guard';
import { CreatePortalAppointmentDto }   from '../dto';

@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class PortalAppointmentsController {
  constructor(private svc: PortalAppointmentsService) {}

  // GET /appointments?status=Pending
  @Get()
  findAll(@Request() req: any, @Query('status') status?: string) {
    return this.svc.findAll(req.user.id, status);
  }

  // POST /appointments
  @Post()
  create(@Request() req: any, @Body() dto: CreatePortalAppointmentDto) {
    return this.svc.create(req.user.id, dto);
  }

  // PATCH /appointments/:id
  @Patch(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: Partial<CreatePortalAppointmentDto>,
  ) {
    return this.svc.update(req.user.id, id, dto);
  }

  // DELETE /appointments/:id
  @Delete(':id')
  cancel(@Request() req: any, @Param('id') id: string) {
    return this.svc.cancel(req.user.id, id);
  }
}