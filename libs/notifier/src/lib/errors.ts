import { NotificationRecipient } from './notification-recipient';

export class RecipientGoneError extends Error {
  override name = 'RecipientGoneError';
  constructor(
    public recipient: NotificationRecipient<unknown>,
    public originalError: unknown,
  ) {
    super('Recipient is gone!');
  }
}
