import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomersModule } from './customers/customers.module';

@Module({
  imports: [CustomersModule], // <-- THIS IS THE CRITICAL PART
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}