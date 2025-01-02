import { IDBKeyValStorage } from '@crypto-monitor/storage';
import { fromEvent, merge } from 'rxjs';
import { createIDBStorage } from './app/idb-storage';
import {
  PeriodicSyncEvent,
  PositionsChecker,
  SyncEvent,
} from './app/service-worker/positions-checker';
import { SSWalletStorage } from './app/ss-wallet-storage';
import { SWMessageChannel } from './app/sw-channel';

importScripts('/ngsw-worker.js');

declare const globalThis: ServiceWorkerGlobalScope;

const idbStorage = new IDBKeyValStorage(createIDBStorage());
const walletStorage = new SSWalletStorage(
  idbStorage as IDBKeyValStorage<string[]>,
);
const channel = new SWMessageChannel();
const positionsChecker = new PositionsChecker(walletStorage, channel);

positionsChecker.handleChecks(
  merge(
    fromEvent<SyncEvent>(globalThis, 'sync'),
    fromEvent<PeriodicSyncEvent>(globalThis, 'periodicsync'),
  ),
);
