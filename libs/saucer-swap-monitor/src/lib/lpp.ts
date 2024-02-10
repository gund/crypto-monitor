import {
  NotificationSubscription,
  NotifierRegistry,
} from '@crypto-monitor/notifier';
import { Subscription, merge, switchMap } from 'rxjs';
import { PositionWithPool } from './api-interfaces';
import { SaucerSwapLPPOutOfRangeEvent } from './events';
import {
  SaucerSwapLPPMonitor,
  SaucerSwapLPPWalletData,
  SaucerSwapLPPosition,
  SaucerSwapLPWallet,
} from './lpp-monitor';
import { NotifierWithIdGenerator } from './notifier';

export interface SaucerSwapLPPConfig {
  monitor: SaucerSwapLPPMonitor;
  notifier: NotifierWithIdGenerator<SaucerSwapLPPWalletData>;
  notifierRegistry: NotifierRegistry<SaucerSwapLPPWalletData>;
}

export class SaucerSwapLPP {
  protected monitor = this.config.monitor;
  protected notifier = this.config.notifier;
  protected notifierRegistry = this.config.notifierRegistry;
  protected subscription = new Subscription();
  protected walletIdToRecipientIds = new Map<string, Set<string>>();
  protected notifiedRecipientsByPosition = new Map<number, Set<string>>();

  constructor(protected readonly config: SaucerSwapLPPConfig) {}

  async init() {
    this.subscription.add(
      this.monitor
        .getWallets()
        .pipe(
          switchMap((wallets) =>
            merge(
              ...wallets.map((wallet) => this.monitorWalletPositions(wallet)),
            ),
          ),
        )
        .subscribe({ error: console.error }),
    );

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
    if (position.isInRange) {
      // If position was previously notified and now is in range,
      // remove it from the notified list so it can be re-notified again
      this.notifiedRecipientsByPosition.delete(position.tokenSN);
    } else {
      try {
        await this.notifyPositionNotInRange(position);
      } catch (e) {
        console.error(
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

      await this.notifier.sendNotification({
        recipient,
        payload: this.getPositionOutOfRangePayload(position),
      });

      if (!this.notifiedRecipientsByPosition.has(position.tokenSN)) {
        this.notifiedRecipientsByPosition.set(position.tokenSN, new Set());
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.notifiedRecipientsByPosition
        .get(position.tokenSN)!
        .add(recipient.id);
    }
  }

  protected getPositionOutOfRangePayload(position: PositionWithPool): unknown {
    return new SaucerSwapLPPOutOfRangeEvent(position);
  }
}

export interface SaucerSwapLPPSubscribeData extends SaucerSwapLPPWalletData {
  subscription: NotificationSubscription<undefined>;
}
