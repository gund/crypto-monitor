import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, isDevMode } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { WebPushNotificationSubscription } from '@crypto-monitor/web-push-notifier';
import {
  EMPTY,
  Observable,
  endWith,
  identity,
  map,
  of,
  switchMap,
  take,
} from 'rxjs';
import { SaucerSwapApiToken } from './saucer-swap-api.token';

@Injectable({ providedIn: 'root' })
export class SaucerSwapPushService {
  private readonly vapidKeyUrl = new URL(
    '/v2/saucer-swap/lpp/vapid-key',
    this.apiUrl,
  ).toString();

  constructor(
    private readonly http: HttpClient,
    private readonly swPush: SwPush,
    @Inject(SaucerSwapApiToken) private readonly apiUrl: URL,
  ) {}

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
      isDevMode() ? endWith({ success: true }) : identity,
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
      isDevMode() ? endWith({ success: true }) : identity,
    );
  }

  private getSubscription(): Observable<
    WebPushNotificationSubscription<undefined>
  > {
    return this.swPush.subscription.pipe(
      // In dev mode skip the subscription
      isDevMode() ? () => EMPTY : identity,
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
