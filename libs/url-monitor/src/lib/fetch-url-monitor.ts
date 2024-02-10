import {
  Observable,
  Subject,
  Subscription,
  catchError,
  interval,
  mergeAll,
  of,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { UrlMonitorPollingError } from './polling-error';
import { UrlMonitor, UrlMonitorRef, UrlMonitorStartData } from './types';
import { UrlMonitorRefImpl } from './url-monitor-ref';

export interface FetchUrlMonitorConfig {
  pollIntervalMs: number;
}

export class FetchUrlMonitor implements UrlMonitor {
  protected dataToMonitor: UrlMonitorStartData<unknown>[] = [];
  protected polling$ = interval(this.config.pollIntervalMs).pipe(
    shareReplay({ refCount: true, bufferSize: 1 })
  );
  protected sink$ = new Subject<Observable<unknown>>();
  protected subscription = new Subscription();

  constructor(protected readonly config: FetchUrlMonitorConfig) {
    this.subscription.add(this.sink$.pipe(mergeAll()).subscribe());
  }

  async start<T = Response>(
    data: UrlMonitorStartData<T>
  ): Promise<UrlMonitorRef<T>> {
    const stop$ = new Subject<void>();
    const data$ = this.poll(data).pipe(
      takeUntil(stop$.pipe(this.syncDataToMonitor(data))),
      shareReplay({ refCount: true, bufferSize: 1 })
    );

    this.sink$.next(data$);

    return new UrlMonitorRefImpl(data$, data, async () => stop$.complete());
  }

  stopAll() {
    this.subscription.unsubscribe();
  }

  protected syncDataToMonitor<T>(data: UrlMonitorStartData<T>) {
    this.dataToMonitor.push(data);

    return tap<void>({
      complete: () =>
        this.dataToMonitor.slice(this.dataToMonitor.indexOf(data), 1),
    });
  }

  protected poll<T>(data: UrlMonitorStartData<T>): Observable<T>;
  protected poll(data: UrlMonitorStartData<unknown>) {
    const request = new Request(data.url, data);
    const selector = data.selector ?? ((res) => of(res));
    const polling$ =
      data.pollIntervalMs !== undefined
        ? interval(data.pollIntervalMs)
        : this.polling$;

    return polling$.pipe(
      startWith(0),
      switchMap(() =>
        fromFetch(request, { selector }).pipe(
          catchError((e) => of(new UrlMonitorPollingError(request, e)))
        )
      )
    );
  }
}
