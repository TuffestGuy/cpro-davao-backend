import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomersModule } from './customers/customers.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { InventoryModule } from './inventory/inventory.module';
import { EmployeesModule } from './employees/employees.module';
import { TransactionModule } from './transaction/transaction.module';
import { ServicesModule } from './services/services.module';
import { ShopSettingsModule } from './shop-settings/shop-settings.module';

@Module({
  imports: [CustomersModule, AppointmentsModule, InventoryModule, EmployeesModule, TransactionModule, ServicesModule, ShopSettingsModule], // <-- THIS IS THE CRITICAL PART
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}