import {
  Controller, Get, Post, Put, Patch,
  Delete, Body, Param,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // POST /appointments
  @Post()
  create(@Body() dto: any) {
    return this.appointmentsService.create(dto);
  }

  // GET /appointments
  @Get()
  findAll() {
    return this.appointmentsService.findAll();
  }

  // GET /appointments/customer/:customerId
@Get('customer/:customerId')
findByCustomer(@Param('customerId') customerId: string) {
  return this.appointmentsService.findByCustomer(customerId);
}

  // GET /appointments/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  // PATCH /appointments/:id/status  ← for "Mark as Complete" button
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.appointmentsService.updateStatus(id, status);
  }

  // PUT /appointments/:id  ← for full edit/save changes
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.appointmentsService.update(id, dto);
  }

  // DELETE /appointments/:id  ← for archive/delete
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}