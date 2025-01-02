import { fromEvent, share } from 'rxjs';

declare global {
  interface ServiceWorkerRegistration {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sync: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    periodicSync: any;
  }
}

export class SWManager {
  readonly supportsSync = 'sync' in ServiceWorkerRegistration.prototype;
  readonly supportsPeriodicSync =
    'periodicSync' in ServiceWorkerRegistration.prototype;
  readonly messages = fromEvent<MessageEvent<unknown>>(this.sw, 'message').pipe(
    share(),
  );

  constructor(protected readonly sw: ServiceWorkerContainer) {
    if (this.supportsSync) {
      this.assertSyncSupport = () => void 0;
    }

    if (this.supportsPeriodicSync) {
      this.assertPeriodicSyncSupport = () => void 0;
    }
  }

  getRegistration() {
    return this.sw.ready;
  }

  async getActiveSW() {
    const reg = await this.getRegistration();

    if (!reg.active) {
      throw new Error('No active service worker');
    }

    return reg.active;
  }

  async getSyncManager() {
    this.assertSyncSupport();

    const reg = await this.getRegistration();
    return reg.sync;
  }

  async getPeriodicSyncManager() {
    this.assertPeriodicSyncSupport();

    const reg = await this.getRegistration();
    return reg.periodicSync;
  }

  async isPeriodicSyncAllowed() {
    const permission = await navigator.permissions.query({
      name: 'periodic-background-sync' as never,
    });

    return permission.state !== 'denied';
  }

  protected assertSyncSupport() {
    throw new Error('SyncManager not supported');
  }

  protected assertPeriodicSyncSupport() {
    throw new Error('PeriodicSyncManager not supported');
  }
}
