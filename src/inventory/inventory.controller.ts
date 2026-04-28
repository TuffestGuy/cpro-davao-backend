import {
  Controller, Get, Post, Body, Patch, Put,
  Param, Delete, HttpCode, HttpStatus,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  create(@Body() dto: CreateInventoryDto) {
    return this.inventoryService.create(dto);
  }

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Patch(':id/stock')
  updateStock(@Param('id') id: string, @Body() dto: UpdateInventoryDto) {
    return this.inventoryService.updateStock(id, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInventoryDto) {
    return this.inventoryService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }
  @Get(':id/movements')
  getMovements(@Param('id') id: string) {
    return this.inventoryService.getMovements(id);
  }

  @Post(':id/movements')
  addMovement(@Param('id') id: string, @Body() body: any) {
    return this.inventoryService.addMovement(id, body);
  }
}
