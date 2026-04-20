import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JobOrdersService } from './job-orders.service';
import { CreateJobOrderDto } from './dto/create-job-order.dto';
import { UpdateJobOrderDto } from './dto/update-job-order.dto';
import { QueryJobOrderDto }  from './dto/query-job-order.dto';

@Controller('job-orders')
export class JobOrdersController {
  constructor(private readonly service: JobOrdersService) {}

  // GET /job-orders?search=&status=&priority=&page=&limit=
  @Get()
  findAll(@Query() query: QueryJobOrderDto) {
    return this.service.findAll(query);
  }

  // GET /job-orders/:id
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  // POST /job-orders
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateJobOrderDto) {
    return this.service.create(dto);
  }

  // PATCH /job-orders/:id
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateJobOrderDto,
  ) {
    return this.service.update(id, dto);
  }

  // DELETE /job-orders/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
