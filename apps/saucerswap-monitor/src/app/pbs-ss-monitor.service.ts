import { Injectable } from '@angular/core';
import {
  PBSMonitorScheduler,
  PBSMonitorSchedulerRef,
} from '@crypto-monitor/url-monitor';
import { defer, firstValueFrom, of, switchMap } from 'rxjs';
import { endWithInDev, skipInDev } from './operators/dev';
import { toVoid } from './operators/void';
import { SaucerSwapMonitorService } from './saucer-swap-monitor.service';
import { SSWalletStorageService } from './ss-wallet-storage.service';
import { SWManagerService } from './sw-manager.service';
import { SWChannelService } from './sw-channel.service';

@Injectable({ providedIn: 'root' })
export class PBSSaucerSwapMonitorService implements SaucerSwapMonitorService {
  private static readonly POLL_INTERVAL = 1000 * 60 * 5;

  private readonly scheduler = new PBSMonitorScheduler(
    PBSSaucerSwapMonitorService.POLL_INTERVAL,
    this.swManagerService,
  );

  constructor(
    private readonly walletStorage: SSWalletStorageService,
    private readonly swManagerService: SWManagerService,
    private readonly swChannelService: SWChannelService,
  ) {}

  async init() {
    await firstValueFrom(this.subscribe());
  }

  subscribe() {
    return defer(() => this.walletStorage.getAllWallets()).pipe(
      skipInDev(),
      switchMap((wallets) =>
        wallets.length > 0 ? this.schedule() : of(undefined),
      ),
      toVoid(),
      endWithInDev(),
    );
  }

  unsubscribe() {
    return defer(() => this.walletStorage.getAllWallets()).pipe(
      skipInDev(),
      switchMap((wallets) =>
        wallets.length === 0 ? this.scheduler.cancelAll() : of(undefined),
      ),
      endWithInDev(),
    );
  }

  async triggerCheck() {
    const syncManager = await this.swManagerService.getSyncManager();
    const ref = await this.schedule();
    await syncManager.register(ref.syncTag);
    this.swChannelService.checkScheduled();
  }

  private async schedule() {
    const ref = await this.getScheduledRef();

    if (ref) {
      return ref;
    }

    return this.scheduler.schedule();
  }

  private async getScheduledRef(): Promise<PBSMonitorSchedulerRef | undefined> {
    const refs = await this.scheduler.getScheduled();
    return refs[0];
  }
}
