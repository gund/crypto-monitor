// eslint-disable-next-line @nx/enforce-module-boundaries
import { NGSWNotificationInfo } from '@crypto-monitor/ngsw-notifications';
import { NGSWPushEvent } from './push-event';

export class NGSWNotifications {
  constructor(
    protected readonly event: ExtendableEvent,
    protected readonly target: EventTarget = globalThis,
  ) {}

  async show(data: NGSWNotificationInfo<string>) {
    this.target.dispatchEvent(
      NGSWPushEvent.with(this.event, JSON.stringify({ notification: data })),
    );
  }
}
