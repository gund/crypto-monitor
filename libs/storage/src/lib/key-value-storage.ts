export interface KeyValueStorage<T = unknown> {
  get<TT = T>(key: StorageKey): Promise<TT | undefined>;
  set<TT = T>(key: StorageKey, value: TT): Promise<void>;
  update<TT = T>(
    key: StorageKey,
    updater: (currentValue: TT | undefined) => TT,
  ): Promise<void>;
  delete(key: StorageKey): Promise<void>;
  getAll(): Promise<Record<StorageKey, T>>;
  clear(): Promise<void>;
}

export type StorageKey = string;
