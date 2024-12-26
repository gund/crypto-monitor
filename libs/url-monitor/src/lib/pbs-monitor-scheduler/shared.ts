import { IdGenerator, UUIDV4IdGenerator } from '../id-generator';

export class BasePBSMonitorSchedulerRef {
  protected static readonly TagPrefix = 'pbs-monitor-scheduler';
  protected static readonly TagSeparator = ':';

  static isSyncTag(tag: string) {
    return tag.startsWith(this.TagPrefix);
  }

  static fromSyncTag<T extends typeof BasePBSMonitorSchedulerRef>(
    this: T,
    tag: string,
  ) {
    if (!this.isSyncTag(tag)) {
      return;
    }

    return new this(this.getId(tag)) as InstanceType<T>;
  }

  static fromId<T extends typeof BasePBSMonitorSchedulerRef>(
    this: T,
    id: string,
  ) {
    return new this(id) as InstanceType<T>;
  }

  protected static getSyncTag(id: string) {
    return [this.TagPrefix, id].join(this.TagSeparator);
  }

  protected static getId(syncTag: string) {
    return syncTag.split(this.TagSeparator)[1];
  }

  readonly id;
  readonly syncTag;

  constructor(
    id?: string,
    public readonly idGenerator: IdGenerator = new UUIDV4IdGenerator(),
  ) {
    this.id = id ?? this.idGenerator.next();
    this.syncTag = BasePBSMonitorSchedulerRef.getSyncTag(this.id);
  }
}
