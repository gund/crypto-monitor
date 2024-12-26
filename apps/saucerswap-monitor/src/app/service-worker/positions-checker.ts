import { NGSWNotifications } from '@crypto-monitor/ngsw-notifications/sw';
import {
  SaucerSwapLPPMonitor,
  SSLPPInRangeNotification,
  SSLPPOutOfRangeNotification,
} from '@crypto-monitor/saucer-swap-monitor';
import {
  FetchUrlMonitor,
  SWPBSMonitorScheduler,
  SWPBSMonitorSchedulerRef,
} from '@crypto-monitor/url-monitor';
import {
  combineLatest,
  filter,
  firstValueFrom,
  map,
  Observable,
  Subscription,
  switchMap,
} from 'rxjs';
import { SSWalletStorage } from '../ss-wallet-storage';
import { SWMessageChannel } from '../sw-channel';

export interface SyncEvent extends ExtendableEvent {
  tag: string;
  lastChance: boolean;
}

export interface PeriodicSyncEvent extends ExtendableEvent {
  tag: string;
}

export class PositionsChecker {
  private isCheckingPositions = false;

  constructor(
    private readonly walletStorage: SSWalletStorage,
    private readonly channel: SWMessageChannel,
  ) {}

  handleChecks(events$: Observable<SyncEvent | PeriodicSyncEvent>) {
    const sub = new Subscription();

    sub.add(
      this.channel.handleMessages({
        'new-client': () => this.notifyPositionsCheckStarted(),
      }),
    );

    sub.add(
      events$
        .pipe(filter((event) => SWPBSMonitorSchedulerRef.isSyncTag(event.tag)))
        .subscribe((event) =>
          event.waitUntil(
            this.checkPositions(
              event,
              SWPBSMonitorSchedulerRef.fromSyncTag(event.tag),
            ),
          ),
        ),
    );

    return sub;
  }

  async checkPositions(event: ExtendableEvent, ref?: SWPBSMonitorSchedulerRef) {
    if (!ref) {
      return;
    }

    const walletIds = await this.walletStorage.getAllWallets();

    if (walletIds.length === 0) {
      return;
    }

    const scheduler = new SWPBSMonitorScheduler(ref);
    const walletMonitor = new FetchUrlMonitor({ scheduler });
    const monitor = new SaucerSwapLPPMonitor({ walletMonitor });
    const ngswNotifications = new NGSWNotifications(event);

    try {
      this.isCheckingPositions = true;
      this.notifyPositionsCheckStarted();
      console.log('Started checking wallet positions', walletIds);

      await monitor.init(walletIds.map((walletId) => ({ walletId })));

      const positions = await firstValueFrom(
        monitor.getWallets().pipe(
          switchMap((wallets) =>
            combineLatest(wallets.map((wallet) => wallet.positions$)),
          ),
          map((positions) => positions.flat()),
        ),
      );

      const outOfRangePositions = positions.filter(
        (position) => !position.isInRange,
      );

      await ngswNotifications.show(
        outOfRangePositions.length === 0
          ? new SSLPPInRangeNotification({ walletCount: walletIds.length })
          : new SSLPPOutOfRangeNotification({ positions: outOfRangePositions }),
      );

      console.log('Checking wallet positions completed', {
        outOfRangePositions,
      });
      this.channel.sendMessage({ type: 'positions-check-completed' });
    } catch (error) {
      console.error('Error checking wallet positions:', error);
      this.channel.sendMessage({
        type: 'positions-check-completed',
        error: String(error),
      });
    } finally {
      this.isCheckingPositions = false;
      await monitor.dispose();
    }
  }

  private notifyPositionsCheckStarted() {
    if (this.isCheckingPositions) {
      this.channel.sendMessage({ type: 'positions-check-started' });
    }
  }
}
