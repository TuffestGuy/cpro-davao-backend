import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';

@Module({
  imports: [
    MulterModule.register({ dest: './uploads/proof-of-payment' }),
  ],
  controllers: [AppointmentsController],
  providers:   [AppointmentsService],
})
export class AppointmentsModule {}
