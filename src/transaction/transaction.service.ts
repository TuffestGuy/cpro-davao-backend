import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.transaction.findMany({
      orderBy: { date: 'desc' } // Newest transactions first
    });
  }

  // A special endpoint for your dashboard graphs!
  async getSummary() {
    const transactions = await this.findAll();
    
    const totalIncome = transactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
      
    const totalExpense = transactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense
    };
  }

  async create(data: CreateTransactionDto) {
    return await this.prisma.transaction.create({
      data: {
        type: data.type,
        category: data.category,
        amount: data.amount,
        description: data.description || '',
        date: data.date ? new Date(data.date) : new Date(),
      }
    });
  }
}