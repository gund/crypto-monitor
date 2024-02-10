import { NotificationRecipient } from './notification-recipient';

export interface NotifierRegistry<TExtras = unknown> {
  addRecipient(
    data: NotificationSubscription<TExtras>
  ): Promise<NotificationRecipient<TExtras>>;
  removeRecipient(id: string): Promise<void>;
  getAllRecipients(): Promise<NotificationRecipient<TExtras>[]>;
  findRecipient(
    id: string
  ): Promise<NotificationRecipient<TExtras> | undefined>;
}

export interface NotificationSubscription<TExtras> {
  endpoint: string;
  extras: TExtras;
}
