import { MonitorScheduler } from './monitor-scheduler';
import { UrlMonitor, UrlMonitorRef, UrlMonitorStartData } from './types';
import {
  FetchUrlMonitorFetcher,
  UrlMonitorFetcher,
} from './url-monitor-fetcher';
import { UrlMonitorRefImpl } from './url-monitor-ref';

export interface FetchUrlMonitorConfig {
  scheduler: MonitorScheduler;
  fetcher?: UrlMonitorFetcher;
}

export class FetchUrlMonitor implements UrlMonitor {
  protected scheduler = this.config.scheduler;
  protected fetcher = this.config.fetcher ?? new FetchUrlMonitorFetcher();

  constructor(protected readonly config: FetchUrlMonitorConfig) {}

  async start<T = Response>(
    data: UrlMonitorStartData<T>,
  ): Promise<UrlMonitorRef<T>> {
    const monitorRef = await this.scheduler.schedule();

    return new UrlMonitorRefImpl(data, monitorRef, this.fetcher);
  }

  stopAll() {
    this.scheduler.cancelAll();
  }
}
