import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const helmet = require('helmet');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const compression = require('compression');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Security
  app.use(helmet({ crossOriginEmbedderPolicy: false }));
  app.use(compression());
  app.use(cookieParser());

  // CORS
  const origins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3001'];
  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-event-token'],
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // API prefix
  app.setGlobalPrefix('api', { exclude: ['/health', '/webhooks/(.*)'] });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Wedding Platform API')
    .setDescription('Production API for Wedding Media SaaS Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`\n🚀 Wedding Platform API running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs at:                 http://localhost:${port}/api/docs`);
  console.log(`❤️  Health check at:                 http://localhost:${port}/health\n`);
}
bootstrap();
