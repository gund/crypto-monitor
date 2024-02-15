import { NotificationSubscription, Notifier } from '@crypto-monitor/notifier';
import { v5 as uuidv5 } from 'uuid';
import { SaucerSwapLPPWalletData } from './lpp-monitor';

export interface NotifierWithIdGenerator<T = unknown> extends Notifier<T> {
  generateRecipientId(data: NotificationSubscription<T>): string;
}

export function saucerSwapNotifier<
  T extends new (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => NotifierWithIdGenerator<SaucerSwapLPPWalletData>,
>(notifier: T): T {
  return class SaucerSwapNotifier extends notifier {
    override generateRecipientId(
      data: NotificationSubscription<SaucerSwapLPPWalletData>,
    ): string {
      return uuidv5(data.extras.walletId, super.generateRecipientId(data));
    }
  };
}
