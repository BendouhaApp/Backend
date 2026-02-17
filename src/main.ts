import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.enableCors({
    origin: (origin, callback) => {
      const configuredOrigins = (config.get<string>('CORS_ORIGINS') || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);

      const defaultOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5180',
      ];

      const allowList = configuredOrigins.length
        ? configuredOrigins
        : defaultOrigins;

      // Allow non-browser requests (curl/postman/server-to-server)
      if (!origin) {
        callback(null, true);
        return;
      }

      const isConfigured = allowList.includes(origin);
      const isLocalhost = /^https?:\/\/localhost:\d+$/.test(origin);
      const isLoopback = /^https?:\/\/127\.0\.0\.1:\d+$/.test(origin);

      if (isConfigured || isLocalhost || isLoopback) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 3600,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, // Throw error on unknown properties
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },

      disableErrorMessages: config.get('NODE_ENV') === 'production', // Hide validation details in production
      validationError: {
        target: false, // Don't expose the object being validated
        value: false, // Don't expose the validated value
      },

      skipMissingProperties: false, // Validate all properties
      skipNullProperties: false,
      skipUndefinedProperties: false,
    }),
  );

  const configSwagger = new DocumentBuilder()
    .setTitle('Bendouha API')
    .setDescription('Admin & Public API for BendouhaApp')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('docs', app, document);

  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  const port = config.get('PORT', 3000);
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
}

bootstrap();
