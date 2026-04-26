import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    return this.prisma.vehicles.findMany({
      where:   { user_id: userId },
      orderBy: { created_at: 'asc' },
    });
  }

  async create(userId: string, dto: {
    name?:        string;
    brand:        string;
    model:        string;
    year:         string;
    plate_number?: string;
    color?:       string;
  }) {
    return this.prisma.vehicles.create({
      data: {
        user_id:      userId,
        name:         dto.name         ?? null,
        brand:        dto.brand,
        model:        dto.model,
        year:         dto.year,
        plate_number: dto.plate_number ?? null,
        color:        dto.color        ?? null,
      },
    });
  }

  async update(id: string, userId: string, dto: Partial<{
    name:         string;
    brand:        string;
    model:        string;
    year:         string;
    plate_number: string;
    color:        string;
  }>) {
    const vehicle = await this.prisma.vehicles.findUnique({ where: { id } });
    if (!vehicle)               throw new NotFoundException('Vehicle not found');
    if (vehicle.user_id !== userId) throw new ForbiddenException('Not your vehicle');

    return this.prisma.vehicles.update({
      where: { id },
      data:  dto,
    });
  }

  async remove(id: string, userId: string) {
    const vehicle = await this.prisma.vehicles.findUnique({ where: { id } });
    if (!vehicle)               throw new NotFoundException('Vehicle not found');
    if (vehicle.user_id !== userId) throw new ForbiddenException('Not your vehicle');

    await this.prisma.vehicles.delete({ where: { id } });
    return { message: 'Vehicle deleted' };
  }
}