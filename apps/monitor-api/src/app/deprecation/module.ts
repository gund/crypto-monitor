import { Module } from '@nestjs/common';
import { AppConfigModule } from '../app-config';
import { ExpressFrameworkModule } from '../framework/express';

@Module({
  imports: [AppConfigModule, ExpressFrameworkModule],
  exports: [AppConfigModule, ExpressFrameworkModule],
})
export class DeprecationModule {}
