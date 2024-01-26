import { KeyValueStorage, StorageKey } from './key-value-storage';

export class BrowserLocalStorage<T = unknown> implements KeyValueStorage<T> {
  constructor(protected readonly storage = localStorage) {}

  async get<TT = T>(key: StorageKey): Promise<TT | undefined> {
    if (!this.storage.getItem(key)) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return JSON.parse(this.storage.getItem(key)!);
  }

  async set(key: StorageKey, value: T): Promise<void> {
    this.storage.setItem(key, JSON.stringify(value));
  }

  async delete(key: StorageKey): Promise<void> {
    this.storage.removeItem(key);
  }

  async getAll(): Promise<Record<StorageKey, T>> {
    const keys = Object.keys(localStorage);
    const entries = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      keys.map(async (key) => [key, (await this.get(key))!] as const)
    );
    return Object.fromEntries(entries);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }
}
