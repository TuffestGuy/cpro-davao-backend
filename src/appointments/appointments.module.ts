import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { PrismaService }         from '../../prisma/prisma.service';

@Module({
  controllers: [AppointmentsController],
  providers:   [AppointmentsService, PrismaService],
})
export class AppointmentsModule {}