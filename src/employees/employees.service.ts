import { createClient } from '@supabase/supabase-js';
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

    const where: Prisma.employeesWhereInput = {
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
    // ← fixed: was dto.name, should be data.name
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
    await this.findOne(id);

    if (updateData.name && updateData.department) {
      const conflict = await this.prisma.employees.findFirst({
        where: {
          name:       { equals: updateData.name,       mode: 'insensitive' },
          department: { equals: updateData.department, mode: 'insensitive' },
          NOT: { id },
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
    await this.findOne(id);

    try {
      await this.prisma.employees.delete({ where: { id } });
      return { message: 'Employee deleted successfully' };
    } catch (err) {
      throw new InternalServerErrorException('Failed to delete employee');
    }
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  private generateEmail(name: string): string {
    return (
      name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@cprodavao.com'
    );
  }

  private departmentToRole(department: string): string {
    const map: Record<string, string> = {
      Technical:  'technician',
      Operations: 'staff',
      Admin:      'admin',
      Sales:      'frontdesk',
    };
    return map[department] ?? 'staff';
  }

  // ─── CREATE WITH ACCOUNT ──────────────────────────────────────────────────

  async createWithAccount(dto: CreateEmployeeDto) {
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const email    = this.generateEmail(dto.name);
    const password = 'CproDavao@2026';
    const role     = this.departmentToRole(dto.department);

    // ← fixed: removed { data: existing } destructuring
    const existing = await this.prisma.employees.findFirst({
      where: { name: { equals: dto.name, mode: 'insensitive' } },
    });

    // Generate unique email if name collision
    const finalEmail = existing
      ? email.replace('@cprodavao.com', `${Date.now()}@cprodavao.com`)
      : email;

    // Create Supabase auth account
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email:         finalEmail,
        password,
        email_confirm: true,
        user_metadata: { full_name: dto.name },
      });

    if (authError) {
      throw new InternalServerErrorException(
        `Failed to create auth account: ${authError.message}`,
      );
    }

    // Create profile row
    await supabaseAdmin.from('profiles').upsert({
      id:         authData.user.id,
      full_name:  dto.name,
      email:      finalEmail,
      role,
      provider:   'email',
      avatar_url: '',
    });

    // Create employee record
    try {
      const employee = await this.prisma.employees.create({
        data: {
          name:               dto.name,
          position:           dto.position,
          department:         dto.department,
          salary:             dto.salary,
          status:             dto.status      ?? 'Active',
          performance:        dto.performance ?? 'Good',
          availability:       'Available',
          current_assignment: 'None',
        },
      });

      return {
        employee,
        credentials: {
          email:    finalEmail,
          password,
          role,
        },
      };
    } catch (err) {
      // Rollback auth user if employee creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new InternalServerErrorException('Failed to create employee record');
    }
  }
}
