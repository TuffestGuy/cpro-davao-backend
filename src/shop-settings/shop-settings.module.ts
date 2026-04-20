import { Module } from '@nestjs/common';
import { ShopSettingsService } from './shop-settings.service';
import { ShopSettingsController } from './shop-settings.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ShopSettingsController],
  providers: [ShopSettingsService, PrismaService],
})
export class ShopSettingsModule {}