import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ArgumentsHost, ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // ตัด property ที่ไม่ได้อยู่ใน DTO ออก
      forbidNonWhitelisted: true, // ถ้าเจอ prop แปลก → error
      transform: true, // แปลง type ให้ตรงกับ DTO เช่น string -> number
    }),
  );
  // app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters({
    catch(exception: any, host: ArgumentsHost) {
      console.error('🔥 Caught exception:', exception);
      throw exception;
    },
  });

  const staticFolders = ['products', 'users', 'categories', 'slides'];

  for (const folder of staticFolders) {
    app.use(
      `/public/uploads/${folder}`,
      express.static(join(__dirname, '..', `public/uploads/${folder}`)),
    );
  }

  app.use(
    '/public/temp-uploads',
    express.static(join(__dirname, '..', 'public/temp-uploads')),
  );

  app.enableCors({
    origin: 'http://localhost:3000', // อนุญาตเฉพาะ Next.js ที่รันบนพอร์ต 3001
    credentials: true, // อนุญาตให้ส่ง cookies หรือ headers อื่น ๆ
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
