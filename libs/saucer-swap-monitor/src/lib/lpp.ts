import {
  NotificationData,
  NotificationRecipient,
  NotificationSubscription,
  NotifierRegistry,
} from '@crypto-monitor/notifier';
import { Subscription, merge, retry, switchMap } from 'rxjs';
import { PositionWithPool } from './api-interfaces';
import { SaucerSwapLPPOutOfRangeEvent } from './events';
import {
  SaucerSwapLPPMonitor,
  SaucerSwapLPPWalletData,
  SaucerSwapLPPosition,
  SaucerSwapLPWallet,
} from './lpp-monitor';
import { NotifierWithIdGenerator } from './notifier';
import { Logger } from './logger';

export interface SaucerSwapLPPConfig {
  monitor: SaucerSwapLPPMonitor;
  notifier: NotifierWithIdGenerator<SaucerSwapLPPWalletData>;
  notifierRegistry: NotifierRegistry<SaucerSwapLPPWalletData>;
  logger?: Logger;
}

export class SaucerSwapLPP {
  protected readonly monitor = this.config.monitor;
  protected readonly notifier = this.config.notifier;
  protected readonly notifierRegistry = this.config.notifierRegistry;
  protected readonly logger = this.config.logger || console;
  protected readonly subscription = new Subscription();
  protected readonly walletIdToRecipientIds = new Map<string, Set<string>>();
  protected readonly notifiedRecipientsByPosition = new Map<
    number,
    Set<string>
  >();

  constructor(protected readonly config: SaucerSwapLPPConfig) {}

  async init() {
    this.initMonitoring();

    const recipients = await this.notifierRegistry.getAllRecipients();
    const data = await Promise.all(
      recipients.map(async (recipient) => ({
        recipient,
        extras: await recipient.getExtras(),
      })),
    );

    data.forEach(({ recipient, extras }) => {
      if (!this.walletIdToRecipientIds.has(extras.walletId)) {
        this.walletIdToRecipientIds.set(extras.walletId, new Set());
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.walletIdToRecipientIds.get(extras.walletId)!.add(recipient.id);
    });

    await this.monitor.init(data.map((d) => d.extras));
  }

  async dispose() {
    this.subscription.unsubscribe();
    await this.monitor.dispose();
  }

  async subscribe(data: SaucerSwapLPPSubscribeData): Promise<void> {
    const recipient = await this.notifierRegistry.addRecipient(
      this.dataToSubscription(data),
    );

    this.logger.log(
      `New recipient ${recipient.id} subscribed to wallet ${data.walletId}`,
    );

    const extras = await recipient.getExtras();

    if (!this.walletIdToRecipientIds.has(extras.walletId)) {
      this.walletIdToRecipientIds.set(extras.walletId, new Set());
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.walletIdToRecipientIds.get(extras.walletId)!.add(recipient.id);

    await this.monitor.start(extras);
  }

  async unsubscribe(data: SaucerSwapLPPSubscribeData): Promise<void> {
    const recipientId = this.notifier.generateRecipientId(
      this.dataToSubscription(data),
    );
    const recipient = await this.notifierRegistry.findRecipient(recipientId);

    if (!recipient) {
      return;
    }

    this.logger.log(
      `Recipient ${recipient.id} unsubscribed from wallet ${data.walletId}`,
    );

    const extras = await recipient.getExtras();

    await this.monitor.stop(extras);
    await this.notifierRegistry.removeRecipient(recipientId);

    Array.from(this.notifiedRecipientsByPosition.entries()).forEach(
      ([positionId, recipients]) => {
        recipients.delete(recipientId);

        if (recipients.size === 0) {
          this.notifiedRecipientsByPosition.delete(positionId);
        }
      },
    );

    this.walletIdToRecipientIds.get(extras.walletId)?.delete(recipientId);

    if (this.walletIdToRecipientIds.get(extras.walletId)?.size === 0) {
      this.walletIdToRecipientIds.delete(extras.walletId);
    }
  }

  protected initMonitoring() {
    this.subscription.add(
      this.monitor
        .getWallets()
        .pipe(
          switchMap((wallets) =>
            merge(
              ...wallets.map((wallet) => this.monitorWalletPositions(wallet)),
            ),
          ),
          retry({ delay: 1000 }),
        )
        .subscribe({
          error: (e) => this.logger.error('Monitor error:', e),
          complete: () => this.logger.error('Monitor completed unexpectedly!'),
        }),
    );
  }

  protected monitorWalletPositions(wallet: SaucerSwapLPWallet) {
    return wallet.positions$.pipe(
      switchMap((positions) =>
        Promise.all(
          positions.map((position) => this.monitorPosition(position)),
        ),
      ),
    );
  }

  protected async monitorPosition(position: SaucerSwapLPPosition) {
    this.logger.log(
      `Position ${position.tokenSN} is in range: ${position.isInRange}`,
    );

    if (position.isInRange) {
      // If position was previously notified and now is in range,
      // remove it from the notified list so it can be re-notified again
      this.notifiedRecipientsByPosition.delete(position.tokenSN);
    } else {
      try {
        await this.notifyPositionNotInRange(position);
      } catch (e) {
        this.logger.error(
          `Failed to notify position not in range ${position.tokenSN}:`,
          e,
        );
      }
    }
  }

  protected dataToSubscription(
    data: SaucerSwapLPPSubscribeData,
  ): NotificationSubscription<SaucerSwapLPPWalletData> {
    return {
      ...data.subscription,
      extras: { walletId: data.walletId },
    };
  }

  protected async notifyPositionNotInRange(position: PositionWithPool) {
    const recipientIds = Array.from(
      this.walletIdToRecipientIds.get(position.accountId) ?? [],
    );

    for (const recipientId of recipientIds) {
      if (
        this.notifiedRecipientsByPosition
          .get(position.tokenSN)
          ?.has(recipientId)
      ) {
        continue;
      }

      const recipient = await this.notifierRegistry.findRecipient(recipientId);

      if (!recipient) {
        continue;
      }

      this.logger.log(
        `Notifying recipient ${recipient.id} about position ${position.tokenSN} out of range`,
      );

      await this.notifier.sendNotification(
        this.getNotificationData(recipient, position),
      );

      if (!this.notifiedRecipientsByPosition.has(position.tokenSN)) {
        this.notifiedRecipientsByPosition.set(position.tokenSN, new Set());
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.notifiedRecipientsByPosition
        .get(position.tokenSN)!
        .add(recipient.id);
    }
  }

  protected getNotificationData(
    recipient: NotificationRecipient<SaucerSwapLPPWalletData>,
    position: PositionWithPool,
  ): NotificationData<SaucerSwapLPPWalletData> {
    return {
      recipient,
      payload: new SaucerSwapLPPOutOfRangeEvent(position),
    };
  }
}

export interface SaucerSwapLPPSubscribeData extends SaucerSwapLPPWalletData {
  subscription: NotificationSubscription<undefined>;
}
