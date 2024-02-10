import { Monitor, MonitorRef } from '@crypto-monitor/monitor';
import { ObservableInput } from 'rxjs';

export interface UrlMonitor extends Monitor<Response> {
  start<T = Response>(data: UrlMonitorStartData<T>): Promise<UrlMonitorRef<T>>;
}

export interface UrlMonitorRef<T> extends MonitorRef<T> {
  readonly url: string;
}

export interface UrlMonitorStartData<T> extends RequestInit {
  url: string;
  pollIntervalMs?: number;
  selector?(response: Response): ObservableInput<T>;
}
