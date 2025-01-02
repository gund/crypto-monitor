import {
  interval,
  map,
  mergeAll,
  Observable,
  share,
  shareReplay,
  startWith,
  Subject,
  Subscription,
  takeUntil,
} from 'rxjs';
import { IdGenerator, UUIDV4IdGenerator } from './id-generator';
import { MonitorScheduler, MonitorSchedulerRef } from './monitor-scheduler';

export class PollMonitorScheduler implements MonitorScheduler {
  protected ref?: MonitorSchedulerRef;
  protected readonly addToSink$ = new Subject<
    Observable<MonitorSchedulerRef>
  >();
  protected readonly sink$ = this.addToSink$.pipe(mergeAll(), share());
  protected subscription = new Subscription();

  constructor(protected readonly intervalMs: number) {
    this.subscription.add(this.sink$.subscribe());
  }

  async schedule() {
    if (this.ref) {
      return this.ref;
    }

    this.ref = new PollMonitorSchedulerRef(interval(this.intervalMs), () => {
      this.ref = undefined;
    });

    this.addToSink$.next(this.ref.onSchedule());

    return this.ref;
  }

  onSchedule() {
    return this.sink$;
  }

  async cancel(refOrId: MonitorSchedulerRef | string) {
    const ref =
      typeof refOrId !== 'string'
        ? refOrId
        : refOrId === this.ref?.id
        ? this.ref
        : undefined;

    await ref?.cancel();
  }

  async cancelAll() {
    await this.ref?.cancel();
    this.subscription.unsubscribe();
    this.subscription = new Subscription();
    this.subscription.add(this.sink$.subscribe());
  }
}

export class PollMonitorSchedulerRef implements MonitorSchedulerRef {
  readonly id = this.idGenerator.next();
  protected readonly cancel$ = new Subject<void>();
  protected readonly schedule$ = this.interval$.pipe(
    startWith(null),
    map(() => this),
    takeUntil(this.cancel$),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  constructor(
    protected readonly interval$: Observable<unknown>,
    protected readonly onCancel: (ref: PollMonitorSchedulerRef) => void,
    protected readonly idGenerator: IdGenerator = new UUIDV4IdGenerator(),
  ) {}

  async cancel() {
    this.cancel$.next();
    this.cancel$.complete();
    this.onCancel(this);
  }

  onSchedule() {
    if (this.cancel$.closed) {
      throw new Error('MonitorSchedulerRef has been canceled');
    }

    return this.schedule$;
  }
}
