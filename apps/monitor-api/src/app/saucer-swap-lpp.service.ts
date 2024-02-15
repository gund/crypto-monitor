import { LmdbStorage } from '@crypto-monitor/lmdb-storage';
import { NotificationRecipient } from '@crypto-monitor/notifier';
import {
  PositionWithPool,
  SaucerSwapLPP,
  SaucerSwapLPPMonitor,
  SaucerSwapLPPWalletData,
} from '@crypto-monitor/saucer-swap-monitor';
import { FetchUrlMonitor } from '@crypto-monitor/url-monitor';
import {
  WebPushNotificationData,
  WebPushNotificationRecipientData,
  WebPushNotificationUrgency,
} from '@crypto-monitor/web-push-notifier';
import { Injectable, Logger } from '@nestjs/common';
import { SSLPPOutOfRangeNotification } from './events';
import { SaucerSwapConfigService } from './saucer-swap-config.service';
import { SaucerSwapWebPushNotifier } from './web-push-notifier-adapter';

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
    const notifier = new SaucerSwapWebPushNotifier({
      storage: storage,
      vapidEmail: configService.vapidEmail,
      vapidPublicKey: configService.vapidPublicKey,
      vapidPrivateKey: configService.vapidPrivateKey,
      namespaceUUID: configService.notifierNamespaceUUID,
    });

    configService.dispose();

    super({
      monitor: monitor,
      notifier: notifier,
      notifierRegistry: notifier,
      logger: Logger,
    });

    this.init().catch((e) =>
      Logger.error('Failed to initialize SaucerSwapLPPService:', e),
    );
  }

  protected override getNotificationData(
    recipient: NotificationRecipient<SaucerSwapLPPWalletData>,
    positions: PositionWithPool[],
  ) {
    return {
      ...super.getNotificationData(recipient, positions),
      payload: { notification: new SSLPPOutOfRangeNotification(positions) },
      urgency: WebPushNotificationUrgency.High,
    } as WebPushNotificationData<SaucerSwapLPPWalletData>;
  }
}
