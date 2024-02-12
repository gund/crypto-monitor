import { Inject, Injectable, InjectionToken } from '@angular/core';
import { BrowserLocalStorage } from '@crypto-monitor/storage';

@Injectable({ providedIn: 'root' })
export class KeyValueStorageService<
  T = unknown,
> extends BrowserLocalStorage<T> {
  constructor(@Inject(BrowserLocalStorageToken) storage: Storage) {
    super(storage);
  }
}

export const BrowserLocalStorageToken = new InjectionToken(
  'BrowserLocalStorage',
  { providedIn: 'root', factory: () => window.localStorage },
);
