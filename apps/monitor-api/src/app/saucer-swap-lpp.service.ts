import { LmdbStorage } from '@crypto-monitor/lmdb-storage';
import {
  PositionWithPool,
  SaucerSwapLPP,
  SaucerSwapLPPMonitor,
  SaucerSwapLPPWalletData,
  SaucerSwapNotifier,
} from '@crypto-monitor/saucer-swap-monitor';
import { FetchUrlMonitor } from '@crypto-monitor/url-monitor';
import { WebPushNotificationRecipientData } from '@crypto-monitor/web-push-notifier';
import { Injectable } from '@nestjs/common';
import { SSLPPOutOfRangeNotification } from './events';
import { SaucerSwapConfigService } from './saucer-swap-config.service';
import { WebPushNotifierWithIdGeneratorAdapter } from './web-push-notifier-adapter';

@Injectable()
export class SaucerSwapLPPService extends SaucerSwapLPP {
  constructor(readonly configService: SaucerSwapConfigService) {
    const urlMonitor = new FetchUrlMonitor({
      pollIntervalMs: configService.positionsPollIntervalMs,
    });
    const monitor = new SaucerSwapLPPMonitor({
      monitor: urlMonitor,
      poolsPollIntervalMs: configService.poolsPollIntervalMs,
    });
    const storage = new LmdbStorage<
      WebPushNotificationRecipientData<SaucerSwapLPPWalletData>
    >({
      path: configService.notifierStoragePath,
    });
    const notifier = new WebPushNotifierWithIdGeneratorAdapter({
      storage: storage,
      vapidEmail: configService.vapidEmail,
      vapidPublicKey: configService.vapidPublicKey,
      vapidPrivateKey: configService.vapidPrivateKey,
      namespaceUUID: configService.notifierNamespaceUUID,
    });

    configService.dispose();

    super({
      monitor: monitor,
      notifier: new SaucerSwapNotifier(notifier),
      notifierRegistry: notifier,
    });

    this.init().catch((e) =>
      console.error('Failed to initialize SaucerSwapLPPService:', e),
    );
  }

  protected override getPositionOutOfRangePayload(position: PositionWithPool) {
    return { notification: new SSLPPOutOfRangeNotification(position) };
  }
}
