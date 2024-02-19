import { WebPushNotificationSubscription } from '@crypto-monitor/web-push-notifier';
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { SaucerSwapLPPService } from './lpp.service';
import { SaucerSwapConfigService } from './config.service';

@Controller('lpp')
export class SaucerSwapLPPController {
  constructor(
    private readonly saucerSwapLPPService: SaucerSwapLPPService,
    private readonly configService: SaucerSwapConfigService,
  ) {}

  @Get('vapid-key')
  getVapidKey() {
    return { vapidKey: this.configService.vapidPublicKey };
  }

  @Post('subscribe/:walletId')
  async subscribe(
    @Param('walletId') walletId: string,
    @Body() subscription: WebPushNotificationSubscription<undefined>,
  ) {
    try {
      await this.saucerSwapLPPService.subscribe({
        walletId,
        subscription,
      });
      return { success: true };
    } catch (e) {
      Logger.error(`Failed to subscribe wallet ${walletId}:`, e, subscription);
      return { success: false };
    }
  }

  @Delete('unsubscribe/:walletId')
  async unsubscribe(
    @Param('walletId') walletId: string,
    @Body() subscription: WebPushNotificationSubscription<undefined>,
  ) {
    try {
      await this.saucerSwapLPPService.unsubscribe({
        walletId,
        subscription,
      });
      return { success: true };
    } catch (e) {
      Logger.error(
        `Failed to unsubscribe wallet ${walletId}:`,
        e,
        subscription,
      );
      return { success: false };
    }
  }
}
