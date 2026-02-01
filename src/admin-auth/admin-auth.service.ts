import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: string, password: string) {
    // user === email
    const admin = await this.prisma.staff_accounts.findUnique({
      where: { email: user },
      select: {
        id: true,
        email: true,
        password_hash: true,
        active: true,
        role_id: true,
      },
    });

    if (!admin || admin.active === false) {
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
      sub: admin.id,        // UUID
      email: admin.email,
      role: 'ADMIN',
    };

    return {
      access_token: this.jwtService.sign(payload),
      token_type: 'Bearer',
      expiresIn: 7200,
    };
  }
}
