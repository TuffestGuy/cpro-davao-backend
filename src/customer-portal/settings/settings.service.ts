import {
  Injectable, UnauthorizedException, BadRequestException,
} from '@nestjs/common';
import { PrismaService }    from '../../../prisma/prisma.service';
import { UpdatePasswordDto, UpdateProfileDto } from '../dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  // PATCH /settings/profile
  async updateProfile(customerId: string, dto: UpdateProfileDto) {
    return await this.prisma.customers.update({
      where: { id: customerId },
      data:  dto,
      select: { id: true, name: true, email: true, phone: true },
    });
  }

  // PATCH /settings/password
  async updatePassword(customerId: string, dto: UpdatePasswordDto) {
    const customer = await this.prisma.customers.findUnique({
      where: { id: customerId },
    });

    if (!customer?.['password']) {
      throw new BadRequestException('No password set on this account');
    }

    const isMatch = await bcrypt.compare(dto.current_password, customer['password']);
    if (!isMatch) throw new UnauthorizedException('Current password is incorrect');

    const hashed = await bcrypt.hash(dto.new_password, 10);

    await this.prisma.customers.update({
      where: { id: customerId },
      data:  { password: hashed } as any,
    });

    return { message: 'Password updated successfully' };
  }
}