import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api'); 
  
  const defaultCorsOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];
  const envCorsOrigins =
    process.env.CORS_ORIGINS ?? process.env.CORS_ORIGIN ?? '';
  const allowedOrigins = envCorsOrigins
    ? envCorsOrigins
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    : defaultCorsOrigins;
  const isOriginAllowed = (origin?: string) => {
    if (!origin) return true; // non-browser clients or same-origin
    if (allowedOrigins.includes('*')) return true;
    return allowedOrigins.includes(origin);
  };

  app.enableCors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept',
  });

  const port = process.env.PORT ?? 3000;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('BendouhaApp API')
    .setDescription('Backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
}

void bootstrap();
