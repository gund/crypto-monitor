import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { WebPushNotificationSubscription } from '@crypto-monitor/web-push-notifier';
import {
  Observable,
  combineLatest,
  firstValueFrom,
  map,
  of,
  switchMap,
  take,
} from 'rxjs';
import { endWithInDev, skipInDev } from './operators/dev';
import { SaucerSwapApiToken } from './saucer-swap-api.token';
import { SaucerSwapMonitorService } from './saucer-swap-monitor.service';
import { SSWalletStorageService } from './ss-wallet-storage.service';

@Injectable({ providedIn: 'root' })
export class SaucerSwapPushService implements SaucerSwapMonitorService {
  private readonly vapidKeyUrl = new URL(
    '/v2/saucer-swap/lpp/vapid-key',
    this.apiUrl,
  ).toString();

  constructor(
    private readonly http: HttpClient,
    private readonly swPush: SwPush,
    private readonly walletStorage: SSWalletStorageService,
    @Inject(SaucerSwapApiToken) private readonly apiUrl: URL,
  ) {}

  async init(): Promise<void> {
    const walletIds = await this.walletStorage.getAllWallets();

    await firstValueFrom(
      combineLatest(walletIds.map((walletId) => this.subscribe(walletId))),
    );
  }

  subscribe(walletId: string) {
    const url = new URL(
      `/v2/saucer-swap/lpp/subscribe/${walletId}`,
      this.apiUrl,
    ).toString();

    return this.getSubscription().pipe(
      take(1),
      switchMap((subscription) =>
        this.http.post<{ success: boolean }>(url, subscription),
      ),
      map((res) => {
        if (!res.success) {
          throw new Error(`Subscription to wallet ${walletId} failed`);
        }
      }),
      endWithInDev(),
    );
  }

  unsubscribe(walletId: string) {
    const url = new URL(
      `/v2/saucer-swap/lpp/unsubscribe/${walletId}`,
      this.apiUrl,
    ).toString();

    return this.getSubscription().pipe(
      take(1),
      switchMap((subscription) =>
        this.http.delete<{ success: boolean }>(url, { body: subscription }),
      ),
      map((res) => {
        if (!res.success) {
          throw new Error(`Unsubscription to wallet ${walletId} failed`);
        }
      }),
      endWithInDev(),
    );
  }

  private getSubscription(): Observable<
    WebPushNotificationSubscription<undefined>
  > {
    return this.swPush.subscription.pipe(
      skipInDev(),
      switchMap((subscription) =>
        subscription ? of(subscription) : this.requestSubscription(),
      ),
      map((subscription) => subscription.toJSON()),
      map((subscription) => ({
        endpoint: subscription.endpoint ?? '',
        p256dhKey: subscription.keys?.['p256dh'] ?? '',
        authKey: subscription.keys?.['auth'] ?? '',
        extras: undefined,
      })),
    );
  }

  private requestSubscription() {
    return this.getVapidKey().pipe(
      switchMap((serverPublicKey) =>
        this.swPush.requestSubscription({ serverPublicKey }),
      ),
    );
  }

  private getVapidKey() {
    return this.http
      .get<{ vapidKey: string }>(this.vapidKeyUrl)
      .pipe(map((res) => res.vapidKey));
  }
}
