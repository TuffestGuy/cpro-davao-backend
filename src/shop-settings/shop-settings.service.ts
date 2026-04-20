import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ShopSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    // Look for the first row
    const settings = await this.prisma.shop_settings.findFirst();
    
    // If no settings exist yet, create a blank default row
    if (!settings) {
      return await this.prisma.shop_settings.create({
        data: {
          business_name: 'My Auto Shop',
          contact_number: '',
          email: '',
          website: '',
          address: ''
        }
      });
    }
    return settings;
  }

  async updateSettings(data: any) {
    const settings = await this.getSettings();
    
    return this.prisma.shop_settings.update({
      where: { id: settings.id },
      data: {
        business_name: data.business_name,
        contact_number: data.contact_number,
        email: data.email,
        website: data.website,
        address: data.address,
        updated_at: new Date(),
      }
    });
  }
}