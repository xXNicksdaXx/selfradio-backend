import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["log", "warn", "error", "debug", "verbose"],
  });
  app.enableCors();
  await app.listen(3000);
  console.log('Server ready!');

}
bootstrap();
