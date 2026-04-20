import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Post()
  create(@Body() createDto: CreateEmployeeDto) {
    return this.employeesService.create(createDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateEmployeeDto) {
    return this.employeesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(204) // Returns a "No Content" success status which is best practice for deletes
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}