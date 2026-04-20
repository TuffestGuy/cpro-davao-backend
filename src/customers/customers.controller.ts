import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(@Body() createCustomerDto: any) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @Get('by-email/:email')
  findByEmail(@Param('email') email: string) {
  return this.customersService.findByEmail(email);
}

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
  return this.customersService.update(id, dto);
}
}