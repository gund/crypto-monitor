import { Observable, of } from 'rxjs';
import { MonitorScheduler, MonitorSchedulerRef } from '../monitor-scheduler';
import { BasePBSMonitorSchedulerRef } from './shared';

export class SWPBSMonitorScheduler implements MonitorScheduler {
  constructor(protected readonly ref: SWPBSMonitorSchedulerRef) {}

  async schedule() {
    return this.ref;
  }

  onSchedule(): Observable<SWPBSMonitorSchedulerRef> {
    throw new Error('Method not implemented.');
  }

  async cancel() {
    throw new Error('Method not implemented.');
  }

  async cancelAll() {
    throw new Error('Method not implemented.');
  }
}

export class SWPBSMonitorSchedulerRef
  extends BasePBSMonitorSchedulerRef
  implements MonitorSchedulerRef
{
  onSchedule() {
    return of(this);
  }

  async cancel() {
    // There is no scheduling so nothing to cancel
  }
}
