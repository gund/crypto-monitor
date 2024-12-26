import { Inject, Injectable, InjectionToken } from '@angular/core';
import { BrowserLocalStorage } from '@crypto-monitor/storage';

@Injectable({ providedIn: 'root' })
export class LocalStorageService<T = unknown> extends BrowserLocalStorage<T> {
  constructor(@Inject(LocalStorageToken) storage: Storage) {
    super(storage);
  }
}

export const LocalStorageToken = new InjectionToken<Storage>('LocalStorage', {
  providedIn: 'root',
  factory: () => window.localStorage,
});
