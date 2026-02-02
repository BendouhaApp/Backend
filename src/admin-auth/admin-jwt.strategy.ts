import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

type AdminJwtPayload = {
  sub: string;
  username: string;
  role: 'ADMIN';
};

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(
  Strategy,
  'admin-jwt',
) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ADMIN_JWT_SECRET as string,
    });
  }

  async validate(payload: AdminJwtPayload) {
    const admin = await this.prisma.staff_accounts.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        username: true,
        active: true,
      },
    });

    if (!admin || admin.active === false) {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      id: admin.id,
      username: admin.username,
      role: 'ADMIN',
    };
  }
}
