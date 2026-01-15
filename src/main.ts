import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Delete all fields which are not in the DTO
    transform: true // Transform the data to the type of the DTO
  }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
