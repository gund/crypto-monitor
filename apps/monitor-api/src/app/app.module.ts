import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SaucerSwapConfigService } from './saucer-swap-config.service';
import { SaucerSwapLPPController } from './saucer-swap-lpp.controller';
import { SaucerSwapLPPService } from './saucer-swap-lpp.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [SaucerSwapLPPController],
  providers: [SaucerSwapLPPService, SaucerSwapConfigService],
})
export class AppModule {}
