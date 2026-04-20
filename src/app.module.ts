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
import { PrismaModule }         from '../prisma/prisma.module';
import { AuthModule }           from './auth/auth.module'; 
import { CustomerPortalModule } from './customer-portal/portal.module';

@Module({
  imports: [
    PrismaModule,         // Global — available everywhere
    AuthModule,           // POST /auth/login, /auth/register
    CustomerPortalModule, // All /customer, /appointments, /history, /payments, /settings
    // Existing admin modules below
    CustomersModule,
    AppointmentsModule,
    InventoryModule,
    EmployeesModule,
    TransactionModule,
    ServicesModule,
    ShopSettingsModule,
  ],
  controllers: [AppController],
  providers:   [AppService],
})
export class AppModule {}
