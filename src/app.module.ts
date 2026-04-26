import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
import { QuoteRequestsModule } from './quote-requests/quote-requests.module';
import { VechiclesModule } from './vechicles/vechicles.module';
import { VehiclesModule } from './vehicles/vehicles.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl:   60_000, // 60 second window
      limit: 120,    // 120 requests per minute (2 per second) — reasonable for a small business app
    }]),
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
    QuoteRequestsModule,
    VechiclesModule,
    VehiclesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}