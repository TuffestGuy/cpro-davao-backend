import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(@Body() dto: any) {
    return this.customersService.create(dto);
  }

  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Get('by-email/:email')
  async findByEmail(@Param('email') email: string) {
    const customer = await this.customersService.findByEmail(email);
    return customer ?? {};
  }

  // PATCH /customers/:id — accepts any fields, strips empty values in service
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.customersService.update(id, dto);
  }
}
