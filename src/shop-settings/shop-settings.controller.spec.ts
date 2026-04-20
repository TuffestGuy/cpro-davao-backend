import { Test, TestingModule } from '@nestjs/testing';
import { ShopSettingsController } from './shop-settings.controller';
import { ShopSettingsService } from './shop-settings.service';

describe('ShopSettingsController', () => {
  let controller: ShopSettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopSettingsController],
      providers: [ShopSettingsService],
    }).compile();

    controller = module.get<ShopSettingsController>(ShopSettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
