import { LmdbStorage } from '@crypto-monitor/lmdb-storage';
import { NotificationRecipient } from '@crypto-monitor/notifier';
import {
  PositionWithPool,
  SaucerSwapLPP,
  SaucerSwapLPPMonitor,
  SaucerSwapLPPWalletData,
  SaucerSwapNotifier,
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
      logger: Logger,
    });

    this.init().catch((e) =>
      Logger.error('Failed to initialize SaucerSwapLPPService:', e),
    );
  }

  protected override getNotificationData(
    recipient: NotificationRecipient<SaucerSwapLPPWalletData>,
    position: PositionWithPool,
  ) {
    return {
      ...super.getNotificationData(recipient, position),
      payload: { notification: new SSLPPOutOfRangeNotification(position) },
      urgency: WebPushNotificationUrgency.High,
    } as WebPushNotificationData<SaucerSwapLPPWalletData>;
  }
}
