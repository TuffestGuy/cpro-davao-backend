import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, Headers,
  UploadedFile, UseInterceptors,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage }     from 'multer';
import { extname }         from 'path';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly svc: AppointmentsService) {}

  // GET /appointments?status=Pending+Verification
  @Get()
  findAll(@Query('status') status?: string) {
    return this.svc.findAll(status);
  }

  // GET /appointments/admin/pending — MUST be before :id routes
  @Get('admin/pending')
  findPending() {
    return this.svc.findPendingVerification();
  }

  // GET /appointments/admin/refunds — pending refund requests
  @Get('admin/refunds')
  findPendingRefunds() {
    return this.svc.findPendingRefunds();
  }

  // GET /appointments/customer/:customerId — MUST be before :id routes
  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string) {
    return this.svc.findByCustomer(customerId);
  }

  // GET /appointments/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  // POST /appointments — multipart/form-data with proof file
  @Post()
  @UseInterceptors(FileInterceptor('proofFile', {
    storage: diskStorage({
      destination: './uploads/proofs',
      filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${extname(file.originalname)}`);
      },
    }),
  }))
  async create(
    @Body() dto: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const localPath = file ? `/uploads/proofs/${file.filename}` : '';
    return this.svc.create(dto, localPath);
  }

  // PATCH /appointments/:id/status
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.svc.updateStatus(id, status);
  }

  // PATCH /appointments/:id/approve
  @Patch(':id/approve')
  approve(
    @Param('id') id: string,
    @Body('remarks') remarks?: string,
    @Headers('x-user-email') approvedBy: string = 'frontdesk',
  ) {
    return this.svc.approve(id, approvedBy, remarks);
  }

  // PATCH /appointments/:id/reject
  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @Body('reason') reason?: string,
    @Headers('x-user-email') rejectedBy: string = 'frontdesk',
  ) {
    return this.svc.reject(id, rejectedBy, reason);
  }

  // PUT /appointments/:id
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.svc.update(id, dto);
  }

  // DELETE /appointments/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  REFUND ENDPOINTS
  // ══════════════════════════════════════════════════════════════════════════

  // PATCH /appointments/:id/refund/request  (customer requests refund)
  @Patch(':id/refund/request')
  requestRefund(
    @Param('id') id: string,
    @Body('amount') amount: number,
  ) {
    return this.svc.requestRefund(id, amount);
  }

  // PATCH /appointments/:id/refund/confirm  (admin confirms + sends email)
  @Patch(':id/refund/confirm')
  confirmRefund(
    @Param('id') id: string,
    @Body('amount') amount: number,
  ) {
    return this.svc.confirmRefund(id, amount);
  }

  // PATCH /appointments/:id/refund/details  (customer submits account info)
  @Patch(':id/refund/details')
  submitRefundDetails(
    @Param('id') id: string,
    @Body() dto: {
      method:      string;
      account:     string;
      accountName: string;
      note?:       string;
    },
  ) {
    return this.svc.submitRefundDetails(id, dto);
  }

  // PATCH /appointments/:id/refund/process  (admin marks done + logs transaction)
  @Patch(':id/refund/process')
  processRefund(@Param('id') id: string) {
    return this.svc.processRefund(id);
  }

  // PATCH /appointments/:id/refund/reject  (admin rejects request)
  @Patch(':id/refund/reject')
  rejectRefund(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.svc.rejectRefund(id, reason);
  }
}