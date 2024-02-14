import {
  NotificationData,
  NotificationSubscription,
  Notifier,
  NotifierRegistry,
} from '@crypto-monitor/notifier';
import { KeyValueStorage } from '@crypto-monitor/storage';
import { v5 as uuidv5 } from 'uuid';
import { sendNotification } from 'web-push';
import { WebPushNotification } from './notification';
import {
  WebPushNotificationRecipient,
  WebPushNotificationRecipientData,
} from './notification-recipient';
import { WebPushNotificationUrgency } from './notification-urgency';

export interface WebPushNotifierConfig<TExtras> {
  vapidPrivateKey: string;
  vapidPublicKey: string;
  vapidEmail: string;
  storage: KeyValueStorage<WebPushNotificationRecipientData<TExtras>>;
  namespaceUUID?: string;
}

export class WebPushNotifier<TExtras = unknown>
  implements Notifier<TExtras>, NotifierRegistry<TExtras>
{
  protected readonly namespaceUUID;
  protected readonly storage;
  readonly #vapidDetails;

  constructor(config: WebPushNotifierConfig<TExtras>) {
    this.namespaceUUID =
      config.namespaceUUID ?? '00000000-0000-0000-0000-000000000000';
    this.storage = config.storage;
    this.#vapidDetails = {
      subject: `mailto:${config.vapidEmail}`,
      privateKey: config.vapidPrivateKey,
      publicKey: config.vapidPublicKey,
    };
  }

  async sendNotification(
    data: WebPushNotificationData<TExtras>,
  ): Promise<WebPushNotification<TExtras>> {
    const response = await sendNotification(
      {
        endpoint: data.recipient.data.endpoint,
        keys: {
          auth: data.recipient.data.authKey,
          p256dh: data.recipient.data.p256dhKey,
        },
      },
      JSON.stringify(data.payload),
      {
        vapidDetails: this.#vapidDetails,
        TTL: data.ttlSeconds,
        topic: data.topic,
        urgency: data.urgency,
      },
    );

    const resourceUrl =
      response.headers['location'] || response.headers['Location'];

    if (!resourceUrl) {
      throw new Error(`Failed to send notification. No resource URL returned.`);
    }

    return new WebPushNotification(
      resourceUrl,
      data.recipient,
      this.namespaceUUID,
    );
  }

  async addRecipient(
    data: WebPushNotificationSubscription<TExtras>,
  ): Promise<WebPushNotificationRecipient<TExtras>> {
    const id = this.generateRecipientId(data);
    const existingRecipient = await this.findRecipient(id);

    if (existingRecipient) {
      return existingRecipient;
    }

    const recipientData: WebPushNotificationRecipientData<TExtras> = {
      id,
      ...data,
    };

    await this.storage.set(recipientData.id, recipientData);

    return new WebPushNotificationRecipient(recipientData);
  }

  async removeRecipient(id: string): Promise<void> {
    await this.storage.delete(id);
  }

  async getAllRecipients(): Promise<WebPushNotificationRecipient<TExtras>[]> {
    return Object.values(await this.storage.getAll()).map(
      (recipient: WebPushNotificationRecipientData<TExtras>) =>
        new WebPushNotificationRecipient(recipient),
    );
  }

  async findRecipient(
    id: string,
  ): Promise<WebPushNotificationRecipient<TExtras> | undefined> {
    const recipient = await this.storage.get(id);

    if (!recipient) {
      return undefined;
    }

    return new WebPushNotificationRecipient(recipient);
  }

  protected generateRecipientId(
    data: WebPushNotificationSubscription<TExtras>,
  ) {
    return uuidv5(data.endpoint, this.namespaceUUID);
  }
}

export interface WebPushNotificationData<TExtras>
  extends NotificationData<TExtras> {
  recipient: WebPushNotificationRecipient<TExtras>;
  ttlSeconds?: number;
  topic?: string;
  urgency?: WebPushNotificationUrgency;
}

export interface WebPushNotificationSubscription<TExtras>
  extends NotificationSubscription<TExtras> {
  p256dhKey: string;
  authKey: string;
}
