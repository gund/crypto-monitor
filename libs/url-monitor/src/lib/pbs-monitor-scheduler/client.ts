import { SWManager } from '@crypto-monitor/ngsw-notifications';
import { Observable } from 'rxjs';
import { MonitorScheduler, MonitorSchedulerRef } from '../monitor-scheduler';
import { BasePBSMonitorSchedulerRef } from './shared';
import { IdGenerator } from '../id-generator';

declare global {
  interface ServiceWorkerRegistration {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    periodicSync: any;
  }
}

export class PBSMonitorScheduler implements MonitorScheduler {
  constructor(
    protected readonly minInterval: number,
    protected readonly swManager: SWManager,
  ) {}

  async schedule() {
    const ref = PBSMonitorSchedulerRef.create(this.swManager);

    const periodicSync = await this.swManager.getPeriodicSyncManager();
    await periodicSync.register(ref.syncTag, { minInterval: this.minInterval });

    return ref;
  }

  onSchedule(): Observable<PBSMonitorSchedulerRef> {
    throw new Error('Method not implemented.');
  }

  async cancel(refOrId: MonitorSchedulerRef | string) {
    const ref =
      typeof refOrId === 'string'
        ? PBSMonitorSchedulerRef.fromId(refOrId, this.swManager)
        : refOrId;

    await ref.cancel();
  }

  async getScheduled() {
    const periodicSync = await this.swManager.getPeriodicSyncManager();
    const tags: string[] = await periodicSync.getTags();

    return tags
      .map((tag) => PBSMonitorSchedulerRef.fromSyncTag(tag, this.swManager))
      .filter((ref): ref is PBSMonitorSchedulerRef => !!ref);
  }

  async cancelAll() {
    const refs = await this.getScheduled();

    await Promise.all(refs.map((ref) => ref.cancel()));
  }
}

type PBSMonitorSchedulerRefCtor = typeof BasePBSMonitorSchedulerRef & {
  new (
    id?: string,
    idGenerator?: IdGenerator,
    swManager?: SWManager,
  ): BasePBSMonitorSchedulerRef;
};

export class PBSMonitorSchedulerRef
  extends BasePBSMonitorSchedulerRef
  implements MonitorSchedulerRef
{
  static create(swManager: SWManager) {
    return new PBSMonitorSchedulerRef(undefined, undefined, swManager);
  }

  static override fromSyncTag<T extends PBSMonitorSchedulerRefCtor>(
    this: T,
    tag: string,
    swManager?: SWManager,
  ) {
    if (!this.isSyncTag(tag)) {
      return;
    }

    return new this(this.getId(tag), undefined, swManager) as InstanceType<T>;
  }

  static override fromId<T extends PBSMonitorSchedulerRefCtor>(
    this: T,
    id: string,
    swManager?: SWManager,
  ) {
    return new this(id, undefined, swManager) as InstanceType<T>;
  }

  protected readonly swManager: SWManager;

  constructor(id?: string, idGenerator?: IdGenerator, swManager?: SWManager) {
    super(id, idGenerator);

    if (!swManager) {
      throw new Error('Missing SWManager argument');
    }

    this.swManager = swManager;
  }

  onSchedule(): Observable<this> {
    throw new Error('Method not implemented.');
  }

  async cancel() {
    const periodicSync = await this.swManager.getPeriodicSyncManager();
    await periodicSync.unregister(this.syncTag);
  }

  async isScheduled() {
    const periodicSync = await this.swManager.getPeriodicSyncManager();
    const tags: string[] = await periodicSync.getTags();
    return tags.includes(this.syncTag);
  }
}
