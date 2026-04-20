import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, ParseUUIDPipe,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { PartRequestsService } from './part-requests.service';
import { CreatePartRequestDto } from './dto/create-part-request.dto';
import { UpdatePartRequestDto } from './dto/update-part-request.dto';

@Controller('part-requests')
export class PartRequestsController {
  constructor(private readonly service: PartRequestsService) {}

  // GET /part-requests?staffId=xxx&status=Pending
  @Get()
  findAll(
    @Query('staffId') staffId?: string,
    @Query('status')  status?: string,
  ) {
    return this.service.findAll(staffId, status);
  }

  // GET /part-requests/:id
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  // POST /part-requests
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreatePartRequestDto) {
    return this.service.create(dto);
  }

  // PATCH /part-requests/:id/status  (admin approves/rejects)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePartRequestDto,
  ) {
    return this.service.updateStatus(id, dto);
  }

  // DELETE /part-requests/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}