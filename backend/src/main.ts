import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('Food Tracker API')
    .setDescription('The Food Tracker API documentation')
    .setVersion('1.0')
    .addCookieAuth('auth-cookie', {
      type: 'apiKey',
      in: 'cookie',
      name: 'jwt',
      description: 'Insert JWT token in cookie',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    explorer: true,
    swaggerOptions: {
      filter: true,
      showRequestDuration: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap().catch((err) => console.error('Error during application bootstrap:', err));
