import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => console.error('Error during application bootstrap:', err));
