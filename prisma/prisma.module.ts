import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global means every module gets PrismaService without importing it
@Global()
@Module({
  providers: [PrismaService],
  exports:   [PrismaService],
})
export class PrismaModule {}