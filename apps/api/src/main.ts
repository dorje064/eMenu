import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('eMenu API')
    .setDescription(
      'Customer authentication and menu management endpoints for the eMenu platform.'
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Customer sign up & login')
    .addTag('menu', 'Menu / food item management')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  // UI at /api/docs, JSON spec at /api/docs-json
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 API running on:  http://localhost:${port}/${globalPrefix}`);
  Logger.log(`📚 Swagger docs:    http://localhost:${port}/${globalPrefix}/docs`);
}

bootstrap();
