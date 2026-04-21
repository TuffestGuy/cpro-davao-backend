// src/quote-requests/quote-requests.module.ts

import { Module } from '@nestjs/common';
import { QuoteRequestsController } from './quote-requests.controller';
import { QuoteRequestsService }    from './quote-requests.service';
import { PrismaService }           from '../../prisma/prisma.service';

@Module({
  controllers: [QuoteRequestsController],
  providers: [
    QuoteRequestsService,
    PrismaService, // injected into QuoteRequestsService via constructor
  ],
})
export class QuoteRequestsModule {}