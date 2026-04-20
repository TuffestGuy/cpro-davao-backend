import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService }   from 'prisma/prisma.service';
import { UpdateProfileDto } from '../dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(customerId: string) {
    const customer = await this.prisma.customers.findUnique({
      where: { id: customerId },
      select: {
        id:         true,
        name:       true,
        email:      true,
        phone:      true,
        vehicle:    true,
        status:     true,
        created_at: true,
      },
    });

    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async updateProfile(customerId: string, dto: UpdateProfileDto) {
    return await this.prisma.customers.update({
      where: { id: customerId },
      data:  dto,
      select: {
        id: true, name: true, email: true,
        phone: true, vehicle: true,
      },
    });
  }
}