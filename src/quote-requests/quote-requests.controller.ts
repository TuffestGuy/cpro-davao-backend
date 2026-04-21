// src/quote-requests/quote-requests.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler'; // <--- 1. ADD THIS IMPORT
import { QuoteRequestsService } from './quote-requests.service';
import { CreateQuoteRequestDto } from './dto/create-quote-request.dto';

@Controller('quote-requests')
export class QuoteRequestsController {
  constructor(private readonly service: QuoteRequestsService) {}

  // POST /quote-requests
  // Called by QuoteForm.tsx on submit
  @Throttle({ default: { limit: 3, ttl: 300_000 } }) // <--- 2. ADD THIS DECORATOR
  @Post()
  @HttpCode(HttpStatus.CREATED) // returns 201, not 200
  create(@Body() dto: CreateQuoteRequestDto) {
    return this.service.create(dto);
  }

  // GET /quote-requests
  // Called by the admin dashboard Quote Requests page
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // PATCH /quote-requests/:id/status
  // Called when admin clicks "Mark as Contacted" / "Close"
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.service.updateStatus(id, status);
  }
}