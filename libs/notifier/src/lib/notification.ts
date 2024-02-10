import { NotificationRecipient } from './notification-recipient';

export interface Notification<TExtras> {
  readonly id: string;
  readonly recipient: NotificationRecipient<TExtras>;
}
