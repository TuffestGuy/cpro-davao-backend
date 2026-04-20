import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.services.findMany({
      orderBy: { name: 'asc' }
    });
  }

  create(data: any) {
    return this.prisma.services.create({
      data: {
        name: data.name,
        category: data.category,
        duration: data.duration,
        price: data.price,
      }
    });
  }

  update(id: string, data: any) {
    return this.prisma.services.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.services.delete({
      where: { id }
    });
  }
}