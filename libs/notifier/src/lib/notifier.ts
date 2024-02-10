import { Notification } from './notification';
import { NotificationRecipient } from './notification-recipient';

export interface Notifier<TExtras = unknown> {
  sendNotification(
    data: NotificationData<TExtras>
  ): Promise<Notification<TExtras>>;
}

export interface NotificationData<TExtras> {
  payload: unknown;
  recipient: NotificationRecipient<TExtras>;
}
