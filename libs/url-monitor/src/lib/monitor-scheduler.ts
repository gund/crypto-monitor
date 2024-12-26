import { Observable } from 'rxjs';

export interface MonitorScheduler {
  schedule(): Promise<MonitorSchedulerRef>;
  onSchedule(): Observable<MonitorSchedulerRef>;
  cancel(refOrId: MonitorSchedulerRef | string): Promise<void>;
  cancelAll(): Promise<void>;
}

export interface MonitorSchedulerRef {
  readonly id: string;
  onSchedule(): Observable<MonitorSchedulerRef>;
  cancel(): Promise<void>;
}
