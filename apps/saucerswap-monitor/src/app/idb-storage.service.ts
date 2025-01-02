import { Inject, Injectable, InjectionToken } from '@angular/core';
import { IDBKeyValStorage } from '@crypto-monitor/storage';
import { UseStore } from 'idb-keyval';
import { createIDBStorage } from './idb-storage';

@Injectable({ providedIn: 'root' })
export class IDBStorageService<T = unknown> extends IDBKeyValStorage<T> {
  constructor(@Inject(IDBStoreToken) store: UseStore) {
    super(store);
  }
}

export const IDBStoreToken = new InjectionToken<UseStore>('IDBStore', {
  providedIn: 'root',
  factory: createIDBStorage,
});
