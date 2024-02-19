import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SaucerSwapConfigService } from './config.service';
import { SaucerSwapLPPController } from './lpp.controller';
import { SaucerSwapLPPService } from './lpp.service';

@Module({
  imports: [ConfigModule],
  controllers: [SaucerSwapLPPController],
  providers: [SaucerSwapLPPService, SaucerSwapConfigService],
  exports: [SaucerSwapLPPService, SaucerSwapConfigService],
})
export class SaucerSwapModule {}
