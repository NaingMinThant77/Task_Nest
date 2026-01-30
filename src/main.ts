/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { YupValidationInterceptor } from './common/interceptiors/yup-validation.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:4000', 
  ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Ensure upload folder exists
  const uploadDir = join(process.cwd(), 'uploads', 'profiles');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Serve uploads statically
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Increase payload limits for Base64 strings
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new YupValidationInterceptor(reflector));
  await app.listen(process.env.PORT || 4000, '0.0.0.0');
}
bootstrap();
