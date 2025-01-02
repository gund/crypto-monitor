import {
  clear,
  createStore,
  del,
  entries,
  get,
  set,
  update,
  UseStore,
} from 'idb-keyval';
import { KeyValueStorage, StorageKey } from './key-value-storage';

export class IDBKeyValStorage<T = unknown> implements KeyValueStorage<T> {
  static create(dbName: string, storeName: string) {
    return new this(createStore(dbName, storeName));
  }

  constructor(protected readonly store: UseStore) {}

  get<TT = T>(key: StorageKey): Promise<TT | undefined> {
    return get(key, this.store);
  }

  set<TT = T>(key: StorageKey, value: TT): Promise<void> {
    return set(key, value, this.store);
  }

  update<TT = T>(
    key: StorageKey,
    updater: (currentValue: TT | undefined) => TT,
  ): Promise<void> {
    return update(key, updater, this.store);
  }

  delete(key: StorageKey): Promise<void> {
    return del(key, this.store);
  }

  async getAll(): Promise<Record<StorageKey, T>> {
    return Object.fromEntries(await entries(this.store));
  }

  clear(): Promise<void> {
    return clear(this.store);
  }
}
