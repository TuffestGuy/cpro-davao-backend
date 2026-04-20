import { Controller, Get, Post, Body } from '@nestjs/common';
import { TransactionsService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get('summary')
  getSummary() {
    return this.transactionsService.getSummary();
  }

  @Post()
  create(@Body() createDto: CreateTransactionDto) {
    return this.transactionsService.create(createDto);
  }
}