export interface KeyValueStorage<T = unknown> {
  get<TT = T>(key: StorageKey): Promise<TT | undefined>;
  set(key: StorageKey, value: T): Promise<void>;
  delete(key: StorageKey): Promise<void>;
  getAll(): Promise<Record<StorageKey, T>>;
  clear(): Promise<void>;
}

export type StorageKey = string;
