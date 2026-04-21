import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, UploadedFile, UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ValidationPipe } from '@nestjs/common';

import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

// ── Multer config ─────────────────────────────────────────────
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
    if (
      allowedMimes.includes(file.mimetype) &&
      allowedExt.test(file.originalname)
    ) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException('Only JPEG, PNG, WEBP, or PDF files are allowed'),
        false,
      );
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
};

// ─────────────────────────────────────────────────────────────
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // POST /appointments
  // Content-Type: multipart/form-data
  // Body fields + file field "proofFile"
  @Post()
  @UseInterceptors(FileInterceptor('proofFile', proofUploadOptions))
  create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: CreateAppointmentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.appointmentsService.create(dto, file);
  }

  // GET /appointments
  // Admin — all bookings
  @Get()
  findAll() {
    return this.appointmentsService.findAll();
  }

  // GET /appointments/admin/pending
  // Admin — only Pending Verification queue
  // ⚠ Must be declared BEFORE :id to avoid route conflict
  @Get('admin/pending')
  findPendingVerification() {
    return this.appointmentsService.findPendingVerification();
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

  // PATCH /appointments/:id/approve
  // Admin approves the booking
  @Patch(':id/approve')
  approve(
    @Param('id') id: string,
    @Body('remarks') remarks?: string,
  ) {
    return this.appointmentsService.approveBooking(id, remarks);
  }

  // PATCH /appointments/:id/reject
  // Admin rejects the booking
  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @Body('remarks') remarks?: string,
  ) {
    return this.appointmentsService.rejectBooking(id, remarks);
  }

  // PATCH /appointments/:id/status
  // General status update (In Progress, Completed, Cancelled)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.appointmentsService.updateStatus(id, status);
  }

  // PUT /appointments/:id
  // Full edit (admin/staff only)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.appointmentsService.update(id, dto);
  }

  // DELETE /appointments/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}