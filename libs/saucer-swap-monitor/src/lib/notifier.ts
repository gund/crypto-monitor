import {
  Notification,
  NotificationData,
  NotificationSubscription,
  Notifier,
} from '@crypto-monitor/notifier';
import { v5 as uuidv5 } from 'uuid';
import { SaucerSwapLPPWalletData } from './lpp-monitor';

export interface NotifierWithIdGenerator<T = unknown> extends Notifier<T> {
  generateRecipientId(data: NotificationSubscription<T>): string;
}

export class SaucerSwapNotifier
  implements NotifierWithIdGenerator<SaucerSwapLPPWalletData>
{
  constructor(
    protected readonly notifier: NotifierWithIdGenerator<SaucerSwapLPPWalletData>,
  ) {}

  sendNotification(
    data: NotificationData<SaucerSwapLPPWalletData>,
  ): Promise<Notification<SaucerSwapLPPWalletData>> {
    return this.notifier.sendNotification(data);
  }

  generateRecipientId(
    data: NotificationSubscription<SaucerSwapLPPWalletData>,
  ): string {
    return uuidv5(
      data.extras.walletId,
      this.notifier.generateRecipientId(data),
    );
  }
}
