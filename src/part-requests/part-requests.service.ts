import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreatePartRequestDto } from './dto/create-part-request.dto';
import { UpdatePartRequestDto } from './dto/update-part-request.dto';

@Injectable()
export class PartRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  // GET all — optionally filter by staff_id or status
  async findAll(staffId?: string, status?: string) {
    return this.prisma.part_requests.findMany({
      where: {
        ...(staffId && { staff_id: staffId }),
        ...(status  && { status }),
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // GET one
  async findOne(id: string) {
    const record = await this.prisma.part_requests.findUnique({
      where: { id },
    });
    if (!record) {
      throw new NotFoundException(`Part request "${id}" not found`);
    }
    return record;
  }

  // POST — staff submits a request
  async create(dto: CreatePartRequestDto) {
    try {
      return await this.prisma.part_requests.create({ data: dto });
    } catch (err) {
      throw new InternalServerErrorException('Failed to create part request');
    }
  }

  // PATCH — admin approves or rejects
  async updateStatus(id: string, dto: UpdatePartRequestDto) {
    await this.findOne(id); // throws 404 if not found
    try {
      return await this.prisma.part_requests.update({
        where: { id },
        data:  { status: dto.status },
      });
    } catch (err) {
      throw new InternalServerErrorException('Failed to update request status');
    }
  }

  // DELETE — staff cancels a pending request
  async remove(id: string) {
    await this.findOne(id);
    try {
      await this.prisma.part_requests.delete({ where: { id } });
      return { message: 'Request deleted successfully' };
    } catch (err) {
      throw new InternalServerErrorException('Failed to delete request');
    }
  }
}