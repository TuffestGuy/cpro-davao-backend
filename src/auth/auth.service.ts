import {
  Injectable, UnauthorizedException, BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma:  PrismaService,
    private jwtSvc:  JwtService,
  ) {}

  async login(dto: LoginDto) {
    // 1. Find customer by email
    const customer = await this.prisma.customers.findFirst({
      where: { email: dto.email },
    });

    if (!customer) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 2. Check password
    // NOTE: your current customers table has no password field.
    // For now we use a simple check — add a password column to use bcrypt properly.
    // See Step 1 schema note below.
    if (!customer['password']) {
      throw new BadRequestException('This account has no password set. Use Google login.');
    }

    const isMatch = await bcrypt.compare(dto.password, customer['password']);
    if (!isMatch) throw new UnauthorizedException('Invalid email or password');

    // 3. Sign JWT
    const payload = { sub: customer.id, email: customer.email };
    const token   = this.jwtSvc.sign(payload);

    return {
      access_token: token,
      customer: {
        id:    customer.id,
        name:  customer.name,
        email: customer.email,
      },
    };
  }

  async register(dto: { name: string; email: string; password: string; phone?: string }) {
    // Check duplicate email
    const existing = await this.prisma.customers.findFirst({
      where: { email: dto.email },
    });
    if (existing) throw new BadRequestException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);

    const customer = await this.prisma.customers.create({
      data: {
        name:       dto.name,
        email:      dto.email,
        phone:      dto.phone ?? null,
        status:     'Active',
        password:   hashed,
      } as any, // 'as any' until you add password column to schema
    });

    const payload = { sub: customer.id, email: customer.email };
    const token   = this.jwtSvc.sign(payload);

    return {
      access_token: token,
      customer: {
        id:    customer.id,
        name:  customer.name,
        email: customer.email,
      },
    };
  }
}