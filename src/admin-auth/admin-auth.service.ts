import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes, createHash } from 'crypto';
import { StringValue } from 'ms';

@Injectable()
export class AdminAuthService {
  private readonly MAX_FAILED_ATTEMPTS = 10;
  private readonly LOCKOUT_DURATION_MINUTES = 5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(
    username: string,
    password: string,
    ip: string,
    userAgent: string,
  ) {
    // Find admin by username
    const admin = await this.prisma.staff_accounts.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        password_hash: true,
        active: true,
        role_id: true,
        failed_login_attempts: true,
        locked_until: true,
        last_failed_login_at: true,
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

    const expiresIn = (this.configService.get<string>(
      'ADMIN_JWT_ACCESS_EXPIRY',
    ) ?? '60m') as StringValue; // Short-lived access token

    // Generic error message to prevent user enumeration
    const invalidCredentialsError = new UnauthorizedException(
      'Invalid credentials',
    );

    if (!admin) {
      // Log failed attempt for non-existent user (for monitoring)
      await this.logFailedLogin(
        null,
        username,
        ip,
        userAgent,
        'USER_NOT_FOUND',
      );
      throw invalidCredentialsError;
    }

    // Check if account is inactive
    if (admin.active === false) {
      await this.logFailedLogin(
        admin.id,
        username,
        ip,
        userAgent,
        'ACCOUNT_INACTIVE',
      );
      throw invalidCredentialsError;
    }

    // Check if account is locked due to failed attempts
    if (admin.locked_until && admin.locked_until > new Date()) {
      const remainingMinutes = Math.ceil(
        (admin.locked_until.getTime() - Date.now()) / (1000 * 60),
      );
      await this.logFailedLogin(
        admin.id,
        username,
        ip,
        userAgent,
        'ACCOUNT_LOCKED',
      );
      throw new UnauthorizedException(
        `Account is locked. Try again in ${remainingMinutes} minute(s)`,
      );
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, admin.password_hash);

    if (!passwordValid) {
      // Increment failed attempts
      await this.handleFailedLogin(admin.id, username, ip, userAgent);
      throw invalidCredentialsError;
    }

    // Successful login - reset failed attempts
    await this.resetFailedAttempts(admin.id);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(admin);

    // Store refresh token (hashed)
    await this.storeRefreshToken(admin.id, refreshToken, ip, userAgent);

    await this.logSuccessfulLogin(admin.id, admin.username, ip, userAgent);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: expiresIn,
      user: {
        id: admin.id,
        username: admin.username,
        role: admin.roles?.role_name || 'ADMIN',
        permissions: admin.roles?.permissions || [],
      },
    };
  }

  //Refresh access token using refresh token
  async refreshToken(refreshToken: string) {
    const expiresIn = (this.configService.get<string>(
      'ADMIN_JWT_ACCESS_EXPIRY',
    ) ?? '60m') as StringValue; // Short-lived access token

    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    // Find refresh token in database
    const storedToken = await this.prisma.admin_refresh_tokens.findFirst({
      where: {
        token_hash: await this.hashToken(refreshToken),
        revoked: false,
        expires_at: {
          gt: new Date(),
        },
      },
      include: {
        staff_accounts: {
          include: {
            roles: true,
          },
        },
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const admin = storedToken.staff_accounts;

    // Check if admin is still active
    if (!admin.active) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Generate new access token
    const payload = {
      sub: admin.id,
      username: admin.username,
      role: admin.roles?.role_name || 'ADMIN',
      permissions: admin.roles?.permissions || [],
      tokenVersion: admin.token_version || 0,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn,
      issuer: 'bendouha-admin',
      audience: 'bendouha-api',
    });

    // Optionally rotate refresh token (recommended)
    const newRefreshToken = await this.rotateRefreshToken(
      storedToken.id,
      admin.id,
    );

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken || refreshToken,
      token_type: 'Bearer',
      expires_in: expiresIn,
    };
  }

  async logout(refreshToken: string) {
    if (!refreshToken) {
      return { message: 'Logged out successfully' };
    }

    const tokenHash = await this.hashToken(refreshToken);

    await this.prisma.admin_refresh_tokens.updateMany({
      where: { token_hash: tokenHash },
      data: { revoked: true },
    });

    return { message: 'Logged out successfully' };
  }

  async invalidateAllSessions(adminId: string) {
    // Increment token version (invalidates all JWTs)
    await this.prisma.staff_accounts.update({
      where: { id: adminId },
      data: {
        token_version: {
          increment: 1,
        },
      },
    });

    // Revoke all refresh tokens
    await this.prisma.admin_refresh_tokens.updateMany({
      where: { admin_id: adminId },
      data: { revoked: true },
    });
  }

  private async generateTokens(admin: any) {
    const expiresIn = (this.configService.get<string>(
      'ADMIN_JWT_ACCESS_EXPIRY',
    ) ?? '60m') as StringValue; // Short-lived access token

    const payload = {
      sub: admin.id,
      username: admin.username,
      role: admin.roles?.role_name || 'ADMIN',
      permissions: admin.roles?.permissions || [],
      tokenVersion: admin.token_version || 0,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn,
      issuer: 'bendouha-admin',
      audience: 'bendouha-api',
    });

    const refreshToken = randomBytes(32).toString('hex');

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(
    adminId: string,
    token: string,
    ip: string,
    userAgent: string,
  ) {
    const tokenHash = await this.hashToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.admin_refresh_tokens.create({
      data: {
        admin_id: adminId,
        token_hash: tokenHash,
        expires_at: expiresAt,
        ip_address: ip,
        user_agent: userAgent,
      },
    });
  }

  private async rotateRefreshToken(oldTokenId: string, adminId: string) {
    // Mark old token as revoked
    await this.prisma.admin_refresh_tokens.update({
      where: { id: oldTokenId },
      data: { revoked: true },
    });

    // Generate new refresh token
    const newToken = randomBytes(32).toString('hex');
    const tokenHash = await this.hashToken(newToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Get IP and user agent from old token
    const oldToken = await this.prisma.admin_refresh_tokens.findUnique({
      where: { id: oldTokenId },
      select: { ip_address: true, user_agent: true },
    });

    await this.prisma.admin_refresh_tokens.create({
      data: {
        admin_id: adminId,
        token_hash: tokenHash,
        expires_at: expiresAt,
        ip_address: oldToken?.ip_address || 'unknown',
        user_agent: oldToken?.user_agent || 'unknown',
      },
    });

    return newToken;
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async handleFailedLogin(
    adminId: string,
    username: string,
    ip: string,
    userAgent: string,
  ) {
    const admin = await this.prisma.staff_accounts.findUnique({
      where: { id: adminId },
      select: { failed_login_attempts: true },
    });

    const attempts = (admin?.failed_login_attempts || 0) + 1;
    const updateData: any = {
      failed_login_attempts: attempts,
      last_failed_login_at: new Date(),
    };

    // Lock account if max attempts reached
    if (attempts >= this.MAX_FAILED_ATTEMPTS) {
      const lockUntil = new Date();
      lockUntil.setMinutes(
        lockUntil.getMinutes() + this.LOCKOUT_DURATION_MINUTES,
      );
      updateData.locked_until = lockUntil;
    }

    await this.prisma.staff_accounts.update({
      where: { id: adminId },
      data: updateData,
    });

    await this.logFailedLogin(
      adminId,
      username,
      ip,
      userAgent,
      'INVALID_PASSWORD',
    );
  }

  private async resetFailedAttempts(adminId: string) {
    await this.prisma.staff_accounts.update({
      where: { id: adminId },
      data: {
        failed_login_attempts: 0,
        locked_until: null,
        last_login_at: new Date(),
      },
    });
  }

  private async logSuccessfulLogin(
    adminId: string,
    username: string,
    ip: string,
    userAgent: string,
  ) {
    await this.prisma.admins_logs.create({
      data: {
        admin_id: adminId,
        action: 'LOGIN',
        entity: 'ADMIN',
        entity_id: adminId,
        description: `Admin "${username}" logged in successfully`,
        metadata: {
          ip_address: ip,
          user_agent: userAgent,
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  private async logFailedLogin(
    adminId: string | null,
    username: string,
    ip: string,
    userAgent: string,
    reason: string,
  ) {
    await this.prisma.admins_logs.create({
      data: {
        admin_id: adminId || 'UNKNOWN',
        action: 'LOGIN_FAILED',
        entity: 'ADMIN',
        entity_id: adminId ?? username,
        description: `Failed login for "${username}" ( ${reason} )`,
        metadata: {
          username,
          ip_address: ip,
          user_agent: userAgent,
          reason,
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  async cleanupExpiredTokens() {
    await this.prisma.admin_refresh_tokens.deleteMany({
      where: {
        OR: [{ expires_at: { lt: new Date() } }, { revoked: true }],
      },
    });
  }
}
