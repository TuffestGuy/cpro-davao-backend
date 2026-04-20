import { Module } from '@nestjs/common';
import { PartRequestsController } from './part-requests.controller';
import { PartRequestsService } from './part-requests.service';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [PartRequestsController],
  providers: [PartRequestsService, PrismaService],
})
export class PartRequestsModule {}