import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

type AdminJwtPayload = {
    sub: number;
    username: string;
    role: 'ADMIN';
};

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ADMIN_JWT_SECRET as string,
    });
  }

  

  async validate(payload: AdminJwtPayload) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        username: true,
        is_active: true,
      },
    });

    if (!admin || !admin.is_active) {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      id: admin.id,
      username: admin.username,
      role: 'ADMIN',
    };
  }
}
