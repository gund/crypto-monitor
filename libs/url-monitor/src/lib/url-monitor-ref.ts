import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { UrlMonitorStartData, UrlMonitorRef } from './types';

export class UrlMonitorRefImpl<T> implements UrlMonitorRef<T> {
  readonly id = this.generateId();
  readonly url = this.config.url;

  constructor(
    public readonly data: Observable<T>,
    protected readonly config: UrlMonitorStartData<T>,
    protected readonly unsubscribeCb: () => Promise<void>
  ) {}

  stop(): Promise<void> {
    return this.unsubscribeCb();
  }

  protected generateId(): string {
    return uuidv4();
  }
}
