/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { YupValidationInterceptor } from './common/interceptiors/yup-validation.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new YupValidationInterceptor(reflector));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
