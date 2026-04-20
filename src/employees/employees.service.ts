import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class EmployeesService {
  
  async findAll() {
    return await prisma.employees.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async create(data: any) {
    return await prisma.employees.create({
      data: {
        name: data.name,
        position: data.position,
        department: data.department,
        salary: data.salary || 0,
        status: data.status || 'Active',
        availability: 'Available',
        current_assignment: 'None'
      }
    });
  }

  async update(id: string, updateData: any) {
    return await prisma.employees.update({
      where: { id },
      data: updateData
    });
  }
}