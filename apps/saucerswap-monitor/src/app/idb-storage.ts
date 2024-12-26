import { createStore } from 'idb-keyval';

export function createIDBStorage() {
  return createStore('ss-idb', 'ss-keyval-store');
}
