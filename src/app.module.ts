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

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl:   60_000,  // Time To Live: The window of time (60,000 milliseconds = 60 seconds)
      limit: 3,      // The maximum number of requests allowed within that window
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
    // keep any modules your teammate added here too
  ],


  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Apply the ThrottlerGuard globally to enforce rate limiting
    }
  ],
})

export class AppModule {}
