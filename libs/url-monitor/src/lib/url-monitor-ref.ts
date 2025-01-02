import { catchError, Observable, share, switchMap, throwError } from 'rxjs';
import { IdGenerator, UUIDV4IdGenerator } from './id-generator';
import { MonitorSchedulerRef } from './monitor-scheduler';
import { UrlMonitorPollingError } from './polling-error';
import { UrlMonitorRef, UrlMonitorStartData } from './types';
import { UrlMonitorFetcher } from './url-monitor-fetcher';

export class UrlMonitorRefImpl<T> implements UrlMonitorRef<T> {
  readonly id = this.idGenerator.next();
  readonly url = this.config.url;
  readonly data = this.getData();

  constructor(
    protected readonly config: UrlMonitorStartData<T>,
    protected readonly monitorRef: MonitorSchedulerRef,
    protected readonly fetcher: UrlMonitorFetcher,
    protected readonly idGenerator: IdGenerator = new UUIDV4IdGenerator(),
  ) {}

  stop() {
    return this.monitorRef.cancel();
  }

  protected getData(): Observable<T> {
    const req = new Request(this.url, this.config);

    const wrapError = catchError<T, Observable<never>>((e) =>
      throwError(() => new UrlMonitorPollingError(req, e)),
    );

    return this.monitorRef.onSchedule().pipe(
      switchMap(() =>
        this.fetcher.fetch(req, this.config.selector).pipe(wrapError),
      ),
      share(),
    );
  }
}
