import { KeyValueStorage, StorageKey } from '@crypto-monitor/storage';
import { RootDatabaseOptionsWithPath, open } from 'lmdb';

export interface LmdbStorageConfig extends RootDatabaseOptionsWithPath {}

export class LmdbStorage<T = unknown> implements KeyValueStorage<T> {
  protected db = open(this.config);

  constructor(protected config: LmdbStorageConfig) {}

  async get<TT = T>(key: StorageKey): Promise<TT | undefined> {
    return this.db.get(key);
  }

  async set(key: StorageKey, value: T): Promise<void> {
    await this.db.put(key, value);
  }

  async delete(key: StorageKey): Promise<void> {
    await this.db.remove(key);
  }

  async getAll(): Promise<Record<StorageKey, T>> {
    return Object.fromEntries(
      this.db.getKeys().map((key) => [key, this.db.get(key)])
    );
  }

  async clear(): Promise<void> {
    await this.db.clearAsync();
  }
}
