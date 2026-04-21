import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Headers,
  HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeeDto }  from './dto/query-employee.dto';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // GET /employees
  @Get()
  findAll(@Query() query: QueryEmployeeDto) {
    return this.employeesService.findAll(query);
  }

  // GET /employees/:id
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeesService.findOne(id);
  }

  // POST /employees/with-account
  @Post('with-account')
  @HttpCode(HttpStatus.CREATED)
  createWithAccount(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.createWithAccount(dto);
  }

  // POST /employees
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateEmployeeDto) {
    return this.employeesService.create(createDto);
  }

  // PATCH /employees/:id
  // Passes x-user-role header to service for hire_date RBAC check
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateEmployeeDto,
    @Headers('x-user-role') userRole?: string,
  ) {
    return this.employeesService.update(id, updateDto, userRole);
  }

  // DELETE /employees/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeesService.remove(id);
  }
}