import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { EmployeesService } from './employees.service';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  findAll() {
    return this.employeesService.findAll();
  }

  @Post()
  create(@Body() createDto: any) {
    return this.employeesService.create(createDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.employeesService.update(id, updateData);
  }
}