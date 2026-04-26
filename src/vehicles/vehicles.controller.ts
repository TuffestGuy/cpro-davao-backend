import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { SkipThrottle   } from '@nestjs/throttler';

@SkipThrottle()
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly svc: VehiclesService) {}

  // GET /vehicles?userId=xxx
  @Get()
  findAll(@Query('userId') userId: string) {
    return this.svc.findAllByUser(userId);
  }

  // POST /vehicles
  @Post()
  create(@Body() body: {
    userId:       string;
    name?:        string;
    brand:        string;
    model:        string;
    year:         string;
    plate_number?: string;
    color?:       string;
  }) {
    const { userId, ...dto } = body;
    return this.svc.create(userId, dto);
  }

  // PUT /vehicles/:id
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: { userId: string; [key: string]: any },
  ) {
    const { userId, ...dto } = body;
    return this.svc.update(id, userId, dto);
  }

  // DELETE /vehicles/:id
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Body() body: { userId: string },
  ) {
    return this.svc.remove(id, body.userId);
  }
}