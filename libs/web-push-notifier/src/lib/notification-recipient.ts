import { NotificationRecipient } from '@crypto-monitor/notifier';

export interface WebPushNotificationRecipientData<TExtras> {
  id: string;
  endpoint: string;
  p256dhKey: string;
  authKey: string;
  extras: TExtras;
}

export class WebPushNotificationRecipient<TExtras>
  implements NotificationRecipient<TExtras>
{
  readonly id = this.data.id;

  constructor(
    public readonly data: WebPushNotificationRecipientData<TExtras>,
  ) {}

  async getExtras(): Promise<TExtras> {
    return this.data.extras;
  }
}
