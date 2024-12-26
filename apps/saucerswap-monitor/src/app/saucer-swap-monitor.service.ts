import { inject, Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { PBSSaucerSwapMonitorService } from './pbs-ss-monitor.service';
import { SaucerSwapPushService } from './saucer-swap-push.service';
import { SWManagerService } from './sw-manager.service';

@Injectable({
  providedIn: 'root',
  useFactory: () =>
    inject(SWManagerService).supportsPeriodicSync
      ? inject(LazySaucerSwapMonitorService)
      : inject(SaucerSwapPushService),
})
export abstract class SaucerSwapMonitorService {
  abstract subscribe(walletId: string): Observable<void>;
  abstract unsubscribe(walletId: string): Observable<void>;
  abstract init?(): Promise<void>;
  abstract triggerCheck?(): Promise<void>;
}

@Injectable({ providedIn: 'root' })
export class LazySaucerSwapMonitorService implements SaucerSwapMonitorService {
  private actualService?: SaucerSwapMonitorService;

  constructor(
    private injector: Injector,
    private swManager: SWManagerService,
  ) {}

  subscribe(walletId: string) {
    return this.getService().subscribe(walletId);
  }

  unsubscribe(walletId: string) {
    return this.getService().unsubscribe(walletId);
  }

  async triggerCheck() {
    if (!this.getService().triggerCheck) {
      throw new Error(
        `LazySaucerSwapMonitorService: Service does not support check trigger`,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.getService().triggerCheck!();
  }

  async init() {
    const isPeriodicSyncAllowed = await this.swManager.isPeriodicSyncAllowed();

    const serviceClass = isPeriodicSyncAllowed
      ? PBSSaucerSwapMonitorService
      : SaucerSwapPushService;

    this.actualService =
      this.injector.get<SaucerSwapMonitorService>(serviceClass);

    await this.actualService.init?.();
  }

  private getService() {
    if (!this.actualService) {
      throw new Error(
        'LazySaucerSwapMonitorService: Actual service is not initialized',
      );
    }

    return this.actualService;
  }
}
