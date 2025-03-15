import { Injectable } from '@angular/core';
import {
  MonitorSchedulerRef,
  PBSMonitorScheduler,
  PBSMonitorSchedulerRef,
} from '@crypto-monitor/url-monitor';
import {
  defer,
  filter,
  firstValueFrom,
  of,
  scan,
  shareReplay,
  switchMap,
} from 'rxjs';
import { endWithInDev, skipInDev } from './operators/dev';
import { toVoid } from './operators/void';
import { SaucerSwapMonitorService } from './saucer-swap-monitor.service';
import { SettingsService } from './settings/settings.service';
import { SSWalletStorageService } from './ss-wallet-storage.service';
import { SWChannelService } from './sw-channel.service';
import { SWManagerService } from './sw-manager.service';

@Injectable({ providedIn: 'root' })
export class PBSSaucerSwapMonitorService implements SaucerSwapMonitorService {
  constructor(
    private readonly walletStorage: SSWalletStorageService,
    private readonly swManagerService: SWManagerService,
    private readonly swChannelService: SWChannelService,
    private readonly scheduler: PBSMonitorSchedulerService,
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

@Injectable({ providedIn: 'root' })
class PBSMonitorSchedulerService {
  private readonly scheduler$ = this.settings.checkingInteval$.pipe(
    scan((prevScheduler, interval) => {
      const curr = new PBSMonitorScheduler(interval, this.swManagerService);

      if (prevScheduler) {
        this.updateScheduler(prevScheduler, curr);
      }

      return curr;
    }, null as PBSMonitorScheduler | null),
    filter((v): v is PBSMonitorScheduler => !!v),
    shareReplay(1),
  );

  constructor(
    private readonly settings: SettingsService,
    private readonly swManagerService: SWManagerService,
  ) {}

  schedule() {
    return this.getScheduler().then((s) => s.schedule());
  }

  onSchedule() {
    return this.getScheduler().then((s) => s.onSchedule());
  }

  cancel(refOrId: MonitorSchedulerRef | string) {
    return this.getScheduler().then((s) => s.cancel(refOrId));
  }

  getScheduled() {
    return this.getScheduler().then((s) => s.getScheduled());
  }

  cancelAll() {
    return this.getScheduler().then((s) => s.cancelAll());
  }

  private getScheduler() {
    return firstValueFrom(this.scheduler$);
  }

  private async updateScheduler(
    prev: PBSMonitorScheduler,
    curr: PBSMonitorScheduler,
  ) {
    const oldRefs = await prev.getScheduled();
    await prev.cancelAll();
    await Promise.all(oldRefs.map(() => curr.schedule()));
  }
}
