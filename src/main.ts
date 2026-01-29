/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { YupValidationInterceptor } from './common/interceptiors/yup-validation.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: [
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

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new YupValidationInterceptor(reflector));
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
