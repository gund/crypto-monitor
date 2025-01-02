import { KeyValueStorage, StorageKey } from './key-value-storage';

export class BrowserLocalStorage<T = unknown> implements KeyValueStorage<T> {
  constructor(protected readonly storage = localStorage) {}

  async get<TT = T>(key: StorageKey): Promise<TT | undefined> {
    return this.getSync(key);
  }

  async set<TT = T>(key: StorageKey, value: TT): Promise<void> {
    this.setSync(key, value);
  }

  async update<TT = T>(
    key: StorageKey,
    updater: (currentValue: TT | undefined) => TT,
  ): Promise<void> {
    this.setSync(key, updater(this.getSync<TT>(key)));
  }

  async delete(key: StorageKey): Promise<void> {
    this.storage.removeItem(key);
  }

  async getAll(): Promise<Record<StorageKey, T>> {
    const keys = Object.keys(localStorage);
    const entries =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      keys.map((key) => [key, this.getSync(key)!] as const);
    return Object.fromEntries(entries);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }

  protected getSync<TT = T>(key: StorageKey): TT | undefined {
    if (!this.storage.getItem(key)) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return JSON.parse(this.storage.getItem(key)!);
  }

  protected setSync<TT = T>(key: StorageKey, value: TT): void {
    this.storage.setItem(key, JSON.stringify(value));
  }
}
