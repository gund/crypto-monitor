import { NotifierWithIdGenerator } from '@crypto-monitor/saucer-swap-monitor';
import {
  WebPushNotificationSubscription,
  WebPushNotifier,
} from '@crypto-monitor/web-push-notifier';

export class WebPushNotifierWithIdGeneratorAdapter<TExtras = unknown>
  extends WebPushNotifier<TExtras>
  implements NotifierWithIdGenerator<TExtras>
{
  override generateRecipientId(data: WebPushNotificationSubscription<TExtras>) {
    return super.generateRecipientId(data);
  }
}
