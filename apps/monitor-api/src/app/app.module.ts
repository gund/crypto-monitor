import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { DeprecationModule } from './deprecation';
import { SaucerSwapModule } from './saucer-swap';
import { SaucerSwapLPPV1Controller } from './saucer-swap/lpp-v1.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DeprecationModule,
    SaucerSwapModule,
    RouterModule.register([{ path: 'saucer-swap', module: SaucerSwapModule }]),
  ],
  controllers: [SaucerSwapLPPV1Controller],
})
export class AppModule {}
