import { Module } from '@nestjs/common';
import { JwtModule , JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthController } from './admin-auth.controller';
import { AdminJwtStrategy } from './admin-jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    // Passport configuration
    PassportModule.register({ defaultStrategy: 'admin-jwt' }),

    // JWT configuration with ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('ADMIN_JWT_SECRET');
        const expiresIn =
          config.get<string>('ADMIN_JWT_ACCESS_EXPIRY') ?? '60m';

        if (!secret) {
          throw new Error('ADMIN_JWT_SECRET is not defined');
        }

        const signOptions: JwtSignOptions = {
          expiresIn: expiresIn as any,
          issuer: 'bendouha-admin',
          audience: 'bendouha-api',
        };

        return {
          secret,
          signOptions,
        };
      },
    }),

    // Rate limiting / throttling
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('THROTTLE_TTL', 60), // 1 minute
            limit: config.get<number>('THROTTLE_LIMIT', 10),
          },
        ],
      }),
    }),
  ],
  controllers: [AdminAuthController],
  providers: [AdminAuthService, AdminJwtStrategy, PrismaService],
  exports: [AdminAuthService], // Export if needed by other modules
})
export class AdminAuthModule {}
