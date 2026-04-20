import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PaymentsService }  from './payments.service';
import { JwtAuthGuard }     from '../../auth/jwt-auth.guard';
import { CreatePaymentDto } from '../dto';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private svc: PaymentsService) {}

  // GET /payments
  @Get()
  findAll(@Request() req: any) {
    return this.svc.findAll(req.user.id);
  }

  // POST /payments
  @Post()
  create(@Request() req: any, @Body() dto: CreatePaymentDto) {
    return this.svc.create(req.user.id, dto);
  }
}