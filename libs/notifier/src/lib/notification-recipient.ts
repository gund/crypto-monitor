export interface NotificationRecipient<TExtras> {
  readonly id: string;
  getExtras(): Promise<TExtras>;
}
