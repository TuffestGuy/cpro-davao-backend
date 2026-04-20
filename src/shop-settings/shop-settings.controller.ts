import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ShopSettingsService } from './shop-settings.service';
import { UpdateShopSettingDto } from './dto/update-shop-setting.dto';

@Controller('shop-settings')
export class ShopSettingsController {
  constructor(private readonly shopSettingsService: ShopSettingsService) {}

  @Get()
  getSettings() {
    return this.shopSettingsService.getSettings();
  }

  @Patch()
  updateSettings(@Body() updateDto: UpdateShopSettingDto) {
    return this.shopSettingsService.updateSettings(updateDto);
  }
}