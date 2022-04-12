import { NestFactory } from '@nestjs/core';
import { ConfigService } from "@nestjs/config";
import * as admin from 'firebase-admin';
import { ServiceAccount } from "firebase-admin";

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["log", "warn", "error", "debug", "verbose"],
  });

  const configService: ConfigService = app.get(ConfigService);

  const adminConfig: ServiceAccount = {
    "projectId": configService.get<string>('FIREBASE_PROJECT_ID'),
    "privateKey": configService.get<string>('FIREBASE_PRIVATE_KEY')
        .replace(/\\n/g, '\n'),
    "clientEmail": configService.get<string>('FIREBASE_CLIENT_EMAIL')
  }

  admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
    storageBucket: "selfradio-f2820.appspot.com"
  })

  app.enableCors();

  await app.listen(3000);

  console.log('Server ready!');

}
bootstrap();
