import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminAuthService {
  constructor( private prisma: PrismaService, private jwtService: JwtService ) {}

  async login(username: string, password: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { username },
      select: {
         id: true,
         username: true,
         password_hash: true,
         is_active: true,
      },
    });

    if (!admin || !admin.is_active) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(
      password,
      admin.password_hash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: admin.id,
      username: admin.username,
      role: 'ADMIN',
    };

    return {
      access_token: this.jwtService.sign(payload),
      token_type: 'Bearer',
      expiresIn: 7200,
    };
  }
}
