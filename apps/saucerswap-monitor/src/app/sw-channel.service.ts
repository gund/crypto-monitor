import { Injectable, OnDestroy } from '@angular/core';
import {
  distinctUntilChanged,
  filter,
  map,
  merge,
  scan,
  shareReplay,
  startWith,
  Subject,
  takeUntil,
} from 'rxjs';
import { OnAppInit } from './app-init.service';
import { SWChannelMessage, SWMessageChannel } from './sw-channel';

@Injectable({ providedIn: 'root' })
export class SWChannelService
  extends SWMessageChannel
  implements OnAppInit, OnDestroy
{
  readonly isCheckingPositions$ = this.messages.pipe(
    scan((current, event) => {
      if (event.data.type === 'positions-check-started') {
        return true;
      }
      if (event.data.type === 'positions-check-completed') {
        return false;
      }
      return current;
    }, false),
    startWith(false),
    distinctUntilChanged(),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  private readonly setCheckScheduled$ = new Subject<void>();
  readonly isCheckScheduled$ = merge(
    this.setCheckScheduled$.pipe(map(() => true)),
    this.isCheckingPositions$.pipe(
      filter((isChecking) => isChecking),
      map(() => false),
    ),
  ).pipe(
    startWith(false),
    distinctUntilChanged(),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  private readonly destroy$ = new Subject<void>();
  private readonly stateful$ = merge(
    this.isCheckingPositions$,
    this.isCheckScheduled$,
  );

  onAppInit() {
    this.stateful$.pipe(takeUntil(this.destroy$)).subscribe();
    this.sendMessageBlind({ type: 'new-client' });
  }

  ngOnDestroy() {
    this.close();
    this.destroy$.next();
  }

  /**
   * Standard message sending is not available as SW may be sleeping.
   * Use {@link SWChannelService.sendMessageBlind()} for sending blindly.
   * @throws Throws error every time it's called.
   */
  override sendMessage() {
    throw new Error('Client SWMessageChannel is only for listening');
  }

  /**
   * Sends message to SW without knowing if it's alive.
   * Message MAY NOT be delivered to SW if it's sleeping or not initialized yet.
   */
  sendMessageBlind(data: SWChannelMessage) {
    super.sendMessage(data);
  }

  checkScheduled() {
    this.setCheckScheduled$.next();
  }
}
