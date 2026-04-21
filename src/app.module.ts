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
import { PartRequestsModule } from './part-requests/part-requests.module';
import { JobOrdersModule } from './job-orders/job-orders.module';
import { ProfilesModule } from './profiles/profiles.module';

@Module({
  imports: [
    CustomersModule,
    AppointmentsModule,
    InventoryModule,
    EmployeesModule,
    TransactionModule,
    ServicesModule,
    ShopSettingsModule,
    PartRequestsModule,
    JobOrdersModule,
    ProfilesModule,
    // keep any modules your teammate added here too
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
