import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppConfigModule } from '../app-config';
import { DeprecationGuard } from './guard';

@Module({
  imports: [AppConfigModule],
  providers: [{ provide: APP_GUARD, useClass: DeprecationGuard }],
})
export class DeprecationModule {}
