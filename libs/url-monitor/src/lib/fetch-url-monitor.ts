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
  throwError,
} from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { UrlMonitorPollingError } from './polling-error';
import { UrlMonitor, UrlMonitorRef, UrlMonitorStartData } from './types';
import { UrlMonitorRefImpl } from './url-monitor-ref';

export interface FetchUrlMonitorConfig {
  pollIntervalMs: number;
}

export class FetchUrlMonitor implements UrlMonitor {
  protected polling$ = interval(this.config.pollIntervalMs).pipe(
    shareReplay({ refCount: true, bufferSize: 1 }),
  );
  protected sink$ = new Subject<Observable<unknown>>();
  protected subscription = new Subscription();

  constructor(protected readonly config: FetchUrlMonitorConfig) {
    this.subscription.add(this.sink$.pipe(mergeAll()).subscribe());
  }

  async start<T = Response>(
    data: UrlMonitorStartData<T>,
  ): Promise<UrlMonitorRef<T>> {
    const stop$ = new Subject<void>();
    const data$ = this.poll(data).pipe(
      takeUntil(stop$),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    this.sink$.next(data$);

    return new UrlMonitorRefImpl(data$, data, async () => stop$.complete());
  }

  stopAll() {
    this.subscription.unsubscribe();
  }

  protected poll<T>(data: UrlMonitorStartData<T>): Observable<T>;
  protected poll(data: UrlMonitorStartData<unknown>) {
    const req = new Request(data.url, data);
    const selector = async (res: Response) => {
      if (!res.ok) {
        const text = await res.text();
        return throwError(
          () =>
            new Error(
              `Request ${req.method} ${req.url} failed with status ${res.status}: ${text}`,
            ),
        );
      }

      return data.selector?.(res) ?? of(res);
    };
    const polling$ =
      data.pollIntervalMs !== undefined
        ? interval(data.pollIntervalMs)
        : this.polling$;

    const wrapError = catchError((e) =>
      throwError(() => new UrlMonitorPollingError(req, e)),
    );

    return polling$.pipe(
      startWith(0),
      switchMap(() => fromFetch(req, { selector }).pipe(wrapError)),
    );
  }
}
