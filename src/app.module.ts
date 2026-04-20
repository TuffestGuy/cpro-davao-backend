import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomersModule } from './customers/customers.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { InventoryModule } from './inventory/inventory.module';
import { EmployeesModule } from './employees/employees.module';

@Module({
  imports: [CustomersModule, AppointmentsModule, InventoryModule, EmployeesModule], // <-- THIS IS THE CRITICAL PART
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}