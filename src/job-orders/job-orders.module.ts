import { Module } from '@nestjs/common';
import { JobOrdersController } from './job-orders.controller';
import { JobOrdersService }    from './job-orders.service';
import { PrismaService }       from 'prisma/prisma.service';

@Module({
  controllers: [JobOrdersController],
  providers:   [JobOrdersService, PrismaService],
})
export class JobOrdersModule {}
