import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      ENABLE_CORS?: string;
    }
  }
}

async function bootstrap() {
  const port = process.env.PORT || '3000';
  const host = process.env.HOST || '0.0.0.0';
  const app = await NestFactory.create(AppModule);

  if (process.env.ENABLE_CORS) {
    app.enableCors({ origin: process.env.ENABLE_CORS });
  }

  await app
    .enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })
    .listen(port, host);

  Logger.log(`🚀 Application is running on: http://${host}:${port}`);
}

bootstrap();
