import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest:   ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:      process.env.JWT_SECRET ?? 'fallback-secret',
    });
  }

  // This runs after the JWT is verified — attaches customer to request
  async validate(payload: { sub: string; email: string }) {
    const customer = await this.prisma.customers.findUnique({
      where: { id: payload.sub },
    });

    if (!customer) throw new UnauthorizedException('Customer not found');

    return customer; // → available as req.user in controllers
  }
}