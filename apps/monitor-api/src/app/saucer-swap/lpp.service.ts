import { LmdbStorage } from '@crypto-monitor/lmdb-storage';
import { NotificationRecipient } from '@crypto-monitor/notifier';
import {
  PositionWithPool,
  SaucerSwapLPP,
  SaucerSwapLPPMonitor,
  SaucerSwapLPPWalletData,
  SSLPPOutOfRangeNotification,
} from '@crypto-monitor/saucer-swap-monitor';
import {
  FetchUrlMonitor,
  PollMonitorScheduler,
} from '@crypto-monitor/url-monitor';
import {
  WebPushNotificationData,
  WebPushNotificationRecipientData,
  WebPushNotificationUrgency,
} from '@crypto-monitor/web-push-notifier';
import { Injectable, Logger } from '@nestjs/common';
import { SaucerSwapConfigService } from './config.service';
import { SaucerSwapWebPushNotifier } from './notifier-adapter';

@Injectable()
export class SaucerSwapLPPService extends SaucerSwapLPP {
  constructor(readonly configService: SaucerSwapConfigService) {
    const walletMonitor = new FetchUrlMonitor({
      scheduler: new PollMonitorScheduler(
        configService.positionsPollIntervalMs,
      ),
    });
    const poolMonitor = new FetchUrlMonitor({
      scheduler: new PollMonitorScheduler(configService.poolsPollIntervalMs),
    });
    const monitor = new SaucerSwapLPPMonitor({ walletMonitor, poolMonitor });
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
      payload: { notification: new SSLPPOutOfRangeNotification({ positions }) },
      urgency: WebPushNotificationUrgency.High,
    } as WebPushNotificationData<SaucerSwapLPPWalletData>;
  }
}
