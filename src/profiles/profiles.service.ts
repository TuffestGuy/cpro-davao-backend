import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class ProfilesService {
  // Find a profile by email — used by useAuth.ts to get role + full_name
  async findByEmail(email: string) {
    return await prisma.profiles.findFirst({
      where: { email },
    });
  }}