import { Injectable, OnDestroy } from '@angular/core';
import {
  PositionWithPool,
  SaucerSwapLPPMonitor,
} from '@crypto-monitor/saucer-swap-monitor';
import {
  FetchUrlMonitor,
  PollMonitorScheduler,
  SWPBSMonitorSchedulerRef,
} from '@crypto-monitor/url-monitor';
import {
  Observable,
  filter,
  firstValueFrom,
  map,
  retry,
  shareReplay,
} from 'rxjs';
import { OnAppInit } from './app-init.service';
import { HttpUrlMonitorFetcherService } from './http-url-monitor-fetcher.service';
import { SaucerSwapMonitorService } from './saucer-swap-monitor.service';
import { SSWalletStorageService } from './ss-wallet-storage.service';
import { SWChannelService } from './sw-channel.service';
import { EventsMonitorScheduler } from './events-monitor-scheduler';

export interface SaucerSwapLPWallet {
  walletId: string;
  positions$: Observable<SaucerSwapLPPosition[]>;
}

export interface SaucerSwapLPPosition extends PositionWithPool {
  isInRange: boolean;
}

@Injectable({ providedIn: 'root' })
export class SaucerSwapLPPService implements OnAppInit, OnDestroy {
  private static readonly POLL_INTERVAL = 1000 * 60 * 5;
  private static readonly POOLS_POLL_INTERVAL = 1000 * 60;

  private readonly swCheckCompleted$ = this.swChannel.messages.pipe(
    filter((message) => message.data.type === 'positions-check-completed'),
    map(() => new SWPBSMonitorSchedulerRef()),
  );

  private readonly monitor = new SaucerSwapLPPMonitor({
    walletMonitor: new FetchUrlMonitor({
      scheduler: new EventsMonitorScheduler(
        new PollMonitorScheduler(SaucerSwapLPPService.POLL_INTERVAL),
        this.swCheckCompleted$,
      ),
      fetcher: this.urlFetcherService,
    }),
    poolMonitor: new FetchUrlMonitor({
      scheduler: new EventsMonitorScheduler(
        new PollMonitorScheduler(SaucerSwapLPPService.POOLS_POLL_INTERVAL),
        this.swCheckCompleted$,
      ),
      fetcher: this.urlFetcherService,
    }),
  });

  private readonly wallets$ = this.monitor
    .getWallets()
    .pipe(
      retry({ delay: 1000 }),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

  constructor(
    private readonly walletStorage: SSWalletStorageService,
    private readonly ssMonitorService: SaucerSwapMonitorService,
    private readonly urlFetcherService: HttpUrlMonitorFetcherService,
    private readonly swChannel: SWChannelService,
  ) {}

  async onAppInit() {
    const walletIds = await this.walletStorage.getAllWallets();
    await this.monitor.init(walletIds.map((walletId) => ({ walletId })));
    await this.ssMonitorService.init?.();
  }

  ngOnDestroy(): void {
    this.monitor.dispose();
  }

  getWallets(): Observable<SaucerSwapLPWallet[]> {
    return this.wallets$;
  }

  async monitorWallet(walletId: string) {
    await this.walletStorage.addWallet(walletId);
    await this.monitor.start({ walletId });
    await firstValueFrom(this.ssMonitorService.subscribe(walletId));
  }

  async stopMonitoringWallet(walletId: string) {
    await this.walletStorage.removeWallet(walletId);
    await this.monitor.stop({ walletId });
    await firstValueFrom(this.ssMonitorService.unsubscribe(walletId));
  }
}
