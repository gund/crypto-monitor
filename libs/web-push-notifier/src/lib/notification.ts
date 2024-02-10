import { Notification, NotificationRecipient } from '@crypto-monitor/notifier';
import { v5 as uuidv5 } from 'uuid';

export class WebPushNotification<TExtras> implements Notification<TExtras> {
  readonly id = this.generateId();

  constructor(
    protected readonly resourceUrl: string,
    public readonly recipient: NotificationRecipient<TExtras>,
    protected readonly namespaceUUID = '00000000-0000-0000-0000-000000000000'
  ) {}

  protected generateId(): string {
    return uuidv5(this.resourceUrl, this.namespaceUUID);
  }
}
