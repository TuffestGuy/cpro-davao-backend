import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateJobOrderDto } from './dto/create-job-order.dto';
import { UpdateJobOrderDto } from './dto/update-job-order.dto';
import { QueryJobOrderDto } from './dto/query-job-order.dto';

@Injectable()
export class JobOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Generate order number ─────────────────────────────────────────────────
  private async generateOrderNo(): Promise<string> {
    const year  = new Date().getFullYear();
    const count = await this.prisma.job_orders.count();
    return `JO-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  // ── GET ALL ───────────────────────────────────────────────────────────────
  async findAll(query: QueryJobOrderDto) {
    const {
      search, status, priority,
      sortBy = 'created_at', sortOrder = 'desc',
      page = 1, limit = 50,
    } = query;

    const where: Prisma.job_ordersWhereInput = {
      ...(status   && { status }),
      ...(priority && { priority }),
      ...(search   && {
        OR: [
          { customer:       { contains: search, mode: 'insensitive' } },
          { vehicle:        { contains: search, mode: 'insensitive' } },
          { service:        { contains: search, mode: 'insensitive' } },
          { assigned_staff: { contains: search, mode: 'insensitive' } },
          { order_no:       { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, data] = await Promise.all([
      this.prisma.job_orders.count({ where }),
      this.prisma.job_orders.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ── GET ONE ───────────────────────────────────────────────────────────────
  async findOne(id: string) {
    const record = await this.prisma.job_orders.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`Job order "${id}" not found`);
    return record;
  }

  // ── CREATE ────────────────────────────────────────────────────────────────
  async create(dto: CreateJobOrderDto) {
    try {
      const order_no = await this.generateOrderNo();
      return await this.prisma.job_orders.create({
        data: {
          order_no,
          customer:       dto.customer,
          vehicle:        dto.vehicle,
          service:        dto.service,
          assigned_staff: dto.assigned_staff,
          staff_id:       dto.staff_id,
          scheduled_date: new Date(dto.scheduled_date),
          estimated_time: dto.estimated_time ?? '2 hours',
          priority:       dto.priority       ?? 'Normal',
          notes:          dto.notes,
          status:         'Pending',
        },
      });
    } catch (err) {
      throw new InternalServerErrorException('Failed to create job order');
    }
  }

  // ── UPDATE ────────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateJobOrderDto) {
    await this.findOne(id);
    try {
      return await this.prisma.job_orders.update({
        where: { id },
        data: {
          ...dto,
          ...(dto.scheduled_date && {
            scheduled_date: new Date(dto.scheduled_date),
          }),
        },
      });
    } catch (err) {
      throw new InternalServerErrorException('Failed to update job order');
    }
  }

  // ── DELETE ────────────────────────────────────────────────────────────────
  async remove(id: string) {
    await this.findOne(id);
    try {
      await this.prisma.job_orders.delete({ where: { id } });
      return { message: 'Job order deleted successfully' };
    } catch (err) {
      throw new InternalServerErrorException('Failed to delete job order');
    }
  }
}
