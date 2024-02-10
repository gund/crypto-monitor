import { Observable } from 'rxjs';

export interface MonitorRef<T> {
  readonly id: string;
  readonly data: Observable<T>;
  stop(): Promise<void>;
}
