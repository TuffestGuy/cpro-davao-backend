import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── GET ALL ──────────────────────────────────────────────────────────────

  async findAll(query: QueryEmployeeDto) {
    const {
      search,
      department,
      status,
      performance,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 20,
    } = query;

    // Build the where clause dynamically
    const where: Prisma.employeesWhereInput = {
      // Search matches name OR position (case-insensitive)
      ...(search && {
        OR: [
          { name:     { contains: search, mode: 'insensitive' } },
          { position: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(department  && { department }),
      ...(status      && { status }),
      ...(performance && { performance }),
    };

    // Run count and data fetch in parallel — faster than two sequential queries
    const [total, data] = await Promise.all([
      this.prisma.employees.count({ where }),
      this.prisma.employees.findMany({
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

  // ─── GET ONE ──────────────────────────────────────────────────────────────

  async findOne(id: string) {
    const employee = await this.prisma.employees.findUnique({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with id "${id}" not found`);
    }

    return employee;
  }

  // ─── CREATE ───────────────────────────────────────────────────────────────

  async create(data: CreateEmployeeDto) {
    // Check for duplicate name in the same department
    const existing = await this.prisma.employees.findFirst({
      where: {
        name:       { equals: data.name,       mode: 'insensitive' },
        department: { equals: data.department, mode: 'insensitive' },
      },
    });

    if (existing) {
      throw new ConflictException(
        `An employee named "${data.name}" already exists in the ${data.department} department`,
      );
    }

    try {
      return await this.prisma.employees.create({
        data: {
          name:               data.name,
          position:           data.position,
          department:         data.department,
          salary:             data.salary,
          status:             data.status      ?? 'Active',
          performance:        data.performance ?? 'Good',
          availability:       'Available',
          current_assignment: 'None',
        },
      });
    } catch (err) {
      throw new InternalServerErrorException('Failed to create employee');
    }
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────

  async update(id: string, updateData: UpdateEmployeeDto) {
    // Throws 404 automatically if not found
    await this.findOne(id);

    // If name + department are both being changed, check for conflict
    if (updateData.name && updateData.department) {
      const conflict = await this.prisma.employees.findFirst({
        where: {
          name:       { equals: updateData.name,       mode: 'insensitive' },
          department: { equals: updateData.department, mode: 'insensitive' },
          NOT: { id }, // exclude self
        },
      });

      if (conflict) {
        throw new ConflictException(
          `An employee named "${updateData.name}" already exists in the ${updateData.department} department`,
        );
      }
    }

    try {
      return await this.prisma.employees.update({
        where: { id },
        data:  updateData,
      });
    } catch (err) {
      throw new InternalServerErrorException('Failed to update employee');
    }
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────

  async remove(id: string) {
    // Throws 404 automatically if not found
    await this.findOne(id);

    try {
      await this.prisma.employees.delete({ where: { id } });
      return { message: 'Employee deleted successfully' };
    } catch (err) {
      throw new InternalServerErrorException('Failed to delete employee');
    }
  }
}