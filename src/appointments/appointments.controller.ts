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

// ── Multer config ─────────────────────────────────────────────────────────────
const proofUploadOptions = {
  storage: diskStorage({
    destination: './uploads/proof-of-payment',
    filename: (_req: any, file: Express.Multer.File, cb: any) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
    const allowedMimes = [
      'image/jpeg', 'image/jpg', 'image/png',
      'image/webp', 'application/pdf',
    ];
    const allowedExt = /\.(jpeg|jpg|png|webp|pdf)$/i;
    if (allowedMimes.includes(file.mimetype) && allowedExt.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Only JPEG, PNG, WEBP, or PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
};

// ─────────────────────────────────────────────────────────────────────────────
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly svc: AppointmentsService) {}

  // POST /appointments — customer booking (multipart/form-data + proof file)
  @Post()
  @UseInterceptors(FileInterceptor('proofFile', proofUploadOptions))
  create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: CreateAppointmentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.appointmentsService.create(dto, file);
  }

  // POST /appointments/admin — admin creates directly (no proof required, auto-Confirmed)
  // ⚠ Must be declared BEFORE :id routes
  @Post('admin')
  createAdmin(@Body() dto: any) {
    return this.appointmentsService.createAdmin(dto);
  }

  // GET /appointments — all bookings (admin)
  @Get()
  findAll(@Query('status') status?: string) {
    return this.svc.findAll(status);
  }

  // GET /appointments/admin/pending — pending verification queue
  // ⚠ Must be declared BEFORE :id routes
  @Get('admin/pending')
  findPending() {
    return this.svc.findPendingVerification();
  }

  // GET /appointments/customer/:customerId — customer's own bookings
  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string) {
    return this.svc.findByCustomer(customerId);
  }

  // GET /appointments/:id — single booking
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  // PATCH /appointments/:id/approve — admin approves
  @Patch(':id/approve')
  approve(
    @Param('id') id: string,
    @Body('remarks') remarks?: string,
  ) {
    return this.appointmentsService.approveBooking(id, remarks);
  }

  // PATCH /appointments/:id/reject — admin rejects
  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @Body('remarks') remarks?: string,
  ) {
    return this.appointmentsService.rejectBooking(id, remarks);
  }

  // PATCH /appointments/:id/status — general status update
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.svc.updateStatus(id, status);
  }

  // ✅ Fix 2: approve not approveBooking
  @Patch(':id/approve')
  approve(
    @Param('id') id: string,
    @Body('remarks') remarks?: string,
    @Headers('x-user-email') approvedBy: string = 'frontdesk',
  ) {
    return this.svc.approve(id, approvedBy, remarks);
  }

  // ✅ Fix 3: reject not rejectBooking
  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @Body('reason') reason?: string,
    @Headers('x-user-email') rejectedBy: string = 'frontdesk',
  ) {
    return this.svc.reject(id, rejectedBy, reason);
  }

  // PUT /appointments/:id — full edit (admin/staff)
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
}
