import { MonitorRef } from './monitor-ref';

export interface Monitor<T> {
  start(data: unknown): Promise<MonitorRef<T>>;
}
