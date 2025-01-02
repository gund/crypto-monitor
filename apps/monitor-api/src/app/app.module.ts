import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { DeprecationModule } from './deprecation';
import { SaucerSwapModule } from './saucer-swap';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DeprecationModule,
    SaucerSwapModule,
    RouterModule.register([{ path: 'saucer-swap', module: SaucerSwapModule }]),
  ],
})
export class AppModule {}
