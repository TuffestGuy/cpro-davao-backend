import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  // This automatically uses the single, safe database connection
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.employees.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: string) {
    return await this.prisma.employees.findUnique({
      where: { id }
    });
  }

  async create(data: CreateEmployeeDto) {
    return await this.prisma.employees.create({
      data: {
        name: data.name,
        position: data.position,
        department: data.department,
        salary: data.salary,
        status: data.status,
        performance: data.performance, // No longer silently dropping this!
        availability: 'Available',
        current_assignment: 'None'
      }
    });
  }

  async update(id: string, updateData: UpdateEmployeeDto) {
    return await this.prisma.employees.update({
      where: { id },
      data: updateData
    });
  }

  async remove(id: string) {
    return await this.prisma.employees.delete({
      where: { id }
    });
  }
}