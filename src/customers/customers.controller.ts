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
async findByEmail(@Param('email') email: string) {
  const customer = await this.customersService.findByEmail(email);
  return customer ?? {}; // ← return empty object instead of null
}

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
  return this.customersService.update(id, dto);
}
}