import { Injectable, OnDestroy } from '@angular/core';
import {
  PositionWithPool,
  SaucerSwapLPPMonitor,
} from '@crypto-monitor/saucer-swap-monitor';
import { FetchUrlMonitor } from '@crypto-monitor/url-monitor';
import { Observable, firstValueFrom } from 'rxjs';
import { KeyValueStorageService } from './key-value-storage.service';
import { SaucerSwapPushService } from './saucer-swap-push.service';
import { OnAppInit } from './app-init.service';

export interface SaucerSwapLPWallet {
  walletId: string;
  positions$: Observable<SaucerSwapLPPosition[]>;
}

export interface SaucerSwapLPPosition extends PositionWithPool {
  isInRange: boolean;
}

@Injectable({ providedIn: 'root' })
export class SaucerSwapLPPService implements OnAppInit, OnDestroy {
  private static readonly WALLET_IDS_KEY = 'ss:wallet-ids';

  private readonly walletIds = new Set<string>();
  private readonly monitor = new SaucerSwapLPPMonitor({
    monitor: new FetchUrlMonitor({ pollIntervalMs: 1000 * 60 * 5 }),
    poolsPollIntervalMs: 1000 * 60 * 1,
  });

  constructor(
    private readonly storage: KeyValueStorageService<string[]>,
    private readonly ssPushService: SaucerSwapPushService,
  ) {}

  async onAppInit() {
    const walletIds = await this.storage.get(
      SaucerSwapLPPService.WALLET_IDS_KEY,
    );

    walletIds?.forEach((walletId) => this.walletIds.add(walletId));
    await this.monitor.init(walletIds?.map((walletId) => ({ walletId })));
  }

  ngOnDestroy(): void {
    this.monitor.dispose();
  }

  getWallets(): Observable<SaucerSwapLPWallet[]> {
    return this.monitor.getWallets();
  }

  async monitorWallet(walletId: string) {
    await firstValueFrom(this.ssPushService.subscribe(walletId));

    this.walletIds.add(walletId);
    await this.monitor.start({ walletId });
    await this.persistWalletIds();
  }

  async stopMonitoringWallet(walletId: string) {
    await firstValueFrom(this.ssPushService.unsubscribe(walletId));

    this.walletIds.delete(walletId);
    await this.monitor.stop({ walletId });
    await this.persistWalletIds();
  }

  private async persistWalletIds() {
    await this.storage.set(
      SaucerSwapLPPService.WALLET_IDS_KEY,
      Array.from(this.walletIds),
    );
  }
}
