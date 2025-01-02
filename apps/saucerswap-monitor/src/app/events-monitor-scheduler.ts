import {
  MonitorScheduler,
  MonitorSchedulerRef,
} from '@crypto-monitor/url-monitor';
import { map, merge, Observable } from 'rxjs';

export class EventsMonitorScheduler implements MonitorScheduler {
  constructor(
    private readonly scheduler: MonitorScheduler,
    private readonly events$: Observable<MonitorSchedulerRef>,
  ) {}

  async schedule() {
    const ref = await this.scheduler.schedule();
    return new EventsMonitorSchedulerRef(ref, this.events$);
  }

  onSchedule() {
    return merge(this.scheduler.onSchedule(), this.events$).pipe(
      map((ref) => new EventsMonitorSchedulerRef(ref, this.events$)),
    );
  }

  cancel(refOrId: MonitorSchedulerRef | string) {
    return this.scheduler.cancel(refOrId);
  }

  cancelAll() {
    return this.scheduler.cancelAll();
  }
}

export class EventsMonitorSchedulerRef implements MonitorSchedulerRef {
  readonly id = this.ref.id;

  constructor(
    private readonly ref: MonitorSchedulerRef,
    private readonly events$: Observable<MonitorSchedulerRef>,
  ) {}

  onSchedule() {
    return merge(this.ref.onSchedule(), this.events$).pipe(
      map((ref) => new EventsMonitorSchedulerRef(ref, this.events$)),
    );
  }

  cancel() {
    return this.ref.cancel();
  }
}
