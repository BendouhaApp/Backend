import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

type AdminJwtPayload = {
  sub: string;
  username: string;
  role: string;
  permissions: string[];
  tokenVersion: number;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
};

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const secret = config.get<string>('ADMIN_JWT_SECRET');

    if (!secret) {
      throw new Error('ADMIN_JWT_SECRET is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      issuer: 'bendouha-admin',
      audience: 'bendouha-api',
      ignoreExpiration: false,
    });
  }

  async validate(payload: AdminJwtPayload) {
    if (!payload?.sub || payload.tokenVersion === undefined) {
      throw new UnauthorizedException('Invalid token structure');
    }

    const admin = await this.prisma.staff_accounts.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        username: true,
        active: true,
        token_version: true,
        roles: {
          select: {
            id: true,
            role_name: true,
            permissions: true,
          },
        },
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin account not found');
    }

    if (!admin.active) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    if (admin.token_version !== payload.tokenVersion) {
      throw new UnauthorizedException(
        'Token has been invalidated. Please login again',
      );
    }

    return {
      id: admin.id,
      username: admin.username,
      role: admin.roles?.role_name || 'STAFF',
      roleId: admin.roles?.id,
      permissions: admin.roles?.permissions || [],
      tokenVersion: admin.token_version,
    };
  }
}
