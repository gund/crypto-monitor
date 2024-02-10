import { UrlMonitorRef } from '@crypto-monitor/url-monitor';
import { v4 as uuidv4 } from 'uuid';
import { ApiNftPositionV2 } from './api-interfaces';

export class SaucerSwapMonitorRef implements UrlMonitorRef<ApiNftPositionV2[]> {
  readonly id = this.generateId();
  readonly url = this.monitorRef.url;
  readonly data = this.monitorRef.data;

  constructor(
    public readonly walletId: string,
    protected readonly monitorRef: UrlMonitorRef<ApiNftPositionV2[]>
  ) {}

  stop(): Promise<void> {
    return this.monitorRef.stop();
  }

  protected generateId(): string {
    return uuidv4();
  }
}
