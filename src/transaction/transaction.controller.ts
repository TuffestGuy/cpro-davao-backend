import { Controller, Get, Post, Body } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  findAll() {
    return this.transactionService.findAll();
  }

  @Get('summary')
  getSummary() {
    return this.transactionService.getSummary();
  }

  @Post()
  create(@Body() createDto: CreateTransactionDto) {
    return this.transactionService.create(createDto);
  }
}