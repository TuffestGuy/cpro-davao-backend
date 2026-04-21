import { createClient } from '@supabase/supabase-js';
import {
  Injectable, NotFoundException,
  ConflictException, InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService }      from 'prisma/prisma.service';
import { Prisma }             from '@prisma/client';
import { CreateEmployeeDto }  from './dto/create-employee.dto';
import { UpdateEmployeeDto }  from './dto/update-employee.dto';
import { QueryEmployeeDto }   from './dto/query-employee.dto';

// ─── DURATION HELPER ──────────────────────────────────────────────────────────
// Calculates human-readable tenure from hire_date to today
// e.g. "2 yrs 4 mos" | "6 mos" | "< 1 month"

export function calcDuration(hireDate: Date | string | null): string {
  if (!hireDate) return 'N/A';

  const start = new Date(hireDate);
  const now   = new Date();

  if (isNaN(start.getTime())) return 'N/A';

  let years  = now.getFullYear() - start.getFullYear();
  let months = now.getMonth()    - start.getMonth();

  if (months < 0) { years--; months += 12; }

  if (years === 0 && months === 0) return '< 1 month';
  if (years === 0)                 return `${months} mo${months !== 1 ? 's' : ''}`;
  if (months === 0)                return `${years} yr${years !== 1 ? 's' : ''}`;
  return `${years} yr${years !== 1 ? 's' : ''} ${months} mo${months !== 1 ? 's' : ''}`;
}

// Returns total months for sorting
export function totalMonths(hireDate: Date | string | null): number {
  if (!hireDate) return 0;
  const start = new Date(hireDate);
  const now   = new Date();
  return (now.getFullYear() - start.getFullYear()) * 12
       + (now.getMonth()    - start.getMonth());
}

// ─── SERVICE ─────────────────────────────────────────────────────────────────

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── GET ALL ────────────────────────────────────────────────────────────────

  async findAll(query: QueryEmployeeDto) {
    const {
      search,
      department,
      status,
      sortBy    = 'name',
      sortOrder = 'asc',
      page      = 1,
      limit     = 20,
    } = query;

    const where: Prisma.employeesWhereInput = {
      ...(search && {
        OR: [
          { name:     { contains: search, mode: 'insensitive' } },
          { position: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(department  && { department  }),
      ...(status      && { status      }),
    };

    // hire_date sort must be handled after fetch since it's a Date field
    const dbSortBy = sortBy === 'tenure' ? 'hire_date' : sortBy;

    const [total, data] = await Promise.all([
      this.prisma.employees.count({ where }),
      this.prisma.employees.findMany({
        where,
        orderBy: { [dbSortBy]: sortBy === 'tenure' ? 'asc' : sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    // Attach computed duration to each employee
    const enriched = data.map(emp => ({
      ...emp,
      duration:     calcDuration(emp.hire_date),
      totalMonths:  totalMonths(emp.hire_date),
      isNew:        totalMonths(emp.hire_date) < 3,  // highlight if < 3 months
    }));

    // If sorting by tenure, sort enriched array (longest → shortest)
    if (sortBy === 'tenure') {
      enriched.sort((a, b) =>
        sortOrder === 'desc'
          ? b.totalMonths - a.totalMonths
          : a.totalMonths - b.totalMonths
      );
    }

    return {
      data: enriched,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── GET ONE ────────────────────────────────────────────────────────────────

  async findOne(id: string) {
    const employee = await this.prisma.employees.findUnique({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with id "${id}" not found`);
    }

    return {
      ...employee,
      duration:    calcDuration(employee.hire_date),
      totalMonths: totalMonths(employee.hire_date),
      isNew:       totalMonths(employee.hire_date) < 3,
    };
  }

  // ─── CREATE ─────────────────────────────────────────────────────────────────

  async create(data: CreateEmployeeDto) {
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
      const employee = await this.prisma.employees.create({
    data: {
      name:               data.name,
      position:           data.position,
      department:         data.department,
       salary:             data.salary,
       status:             data.status ?? 'Active',
     availability:       'Available',
      current_assignment: 'None',
     hire_date: data.hire_date ? new Date(data.hire_date) : new Date(),
    // performance removed ✅
  },
});

      return {
        ...employee,
        duration:    calcDuration(employee.hire_date),
        totalMonths: totalMonths(employee.hire_date),
        isNew:       totalMonths(employee.hire_date) < 3,
      };
    } catch (err) {
      throw new InternalServerErrorException('Failed to create employee');
    }
  }

  // ─── UPDATE ─────────────────────────────────────────────────────────────────

  async update(
    id:         string,
    updateData: UpdateEmployeeDto,
    userRole?:  string,   // passed from controller
  ) {
    await this.findOne(id);

    // RBAC — only admins can change hire_date
    if (updateData.hire_date && userRole !== 'admin') {
      throw new ForbiddenException('Only admins can update the hire date');
    }

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
      const employee = await this.prisma.employees.update({
        where: { id },
        data: {
          ...updateData,
          // Convert hire_date string → Date if provided
          ...(updateData.hire_date && {
            hire_date: new Date(updateData.hire_date),
          }),
        },
      });

      return {
        ...employee,
        duration:    calcDuration(employee.hire_date),
        totalMonths: totalMonths(employee.hire_date),
        isNew:       totalMonths(employee.hire_date) < 3,
      };
    } catch (err) {
      throw new InternalServerErrorException('Failed to update employee');
    }
  }

  // ─── DELETE ─────────────────────────────────────────────────────────────────

  async remove(id: string) {
    await this.findOne(id);

    try {
      await this.prisma.employees.delete({ where: { id } });
      return { message: 'Employee deleted successfully' };
    } catch (err) {
      throw new InternalServerErrorException('Failed to delete employee');
    }
  }

  // ─── HELPERS ────────────────────────────────────────────────────────────────

  private generateEmail(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@cprodavao.com';
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

  // ─── CREATE WITH ACCOUNT ────────────────────────────────────────────────────

  async createWithAccount(dto: CreateEmployeeDto) {
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const email    = this.generateEmail(dto.name);
    const password = 'CproDavao@2026';
    const role     = this.departmentToRole(dto.department);

    const existing = await this.prisma.employees.findFirst({
      where: { name: { equals: dto.name, mode: 'insensitive' } },
    });

    const finalEmail = existing
      ? email.replace('@cprodavao.com', `${Date.now()}@cprodavao.com`)
      : email;

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

    await supabaseAdmin.from('profiles').upsert({
      id:         authData.user.id,
      full_name:  dto.name,
      email:      finalEmail,
      role,
      provider:   'email',
      avatar_url: '',
    });

    try {
      const employee = await this.prisma.employees.create({
  data: {
    name:               dto.name,
    position:           dto.position,
    department:         dto.department,
    salary:             dto.salary,
    status:             dto.status ?? 'Active',
    availability:       'Available',
    current_assignment: 'None',
    hire_date: dto.hire_date ? new Date(dto.hire_date) : new Date(),
    // performance removed ✅
  },
});

      return {
        employee: {
          ...employee,
          duration:    calcDuration(employee.hire_date),
          totalMonths: totalMonths(employee.hire_date),
          isNew:       totalMonths(employee.hire_date) < 3,
        },
        credentials: { email: finalEmail, password, role },
      };
    } catch (err) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new InternalServerErrorException('Failed to create employee record');
    }
  }
}