import {
  NotificationData,
  NotificationRecipient,
  NotificationSubscription,
  NotifierRegistry,
  RecipientGoneError,
} from '@crypto-monitor/notifier';
import {
  OperatorFunction,
  Subscription,
  catchError,
  combineLatest,
  debounceTime,
  defer,
  filter,
  map,
  merge,
  retry,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { PositionWithPool } from './api-interfaces';
import { SaucerSwapLPPositionsOutOfRangeEvent } from './events';
import { Logger } from './logger';
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
  logger?: Logger;
  notificationRetryCount?: number;
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

    await this.doUnsubscribe(recipient);
  }

  protected async doUnsubscribe(
    recipient: NotificationRecipient<SaucerSwapLPPWalletData>,
  ) {
    const extras = await recipient.getExtras();

    this.logger.log(
      `Recipient ${recipient.id} unsubscribed from wallet ${extras.walletId}`,
    );

    await this.monitor.stop(extras);
    await this.notifierRegistry.removeRecipient(recipient.id);

    Array.from(this.notifiedRecipientsByPosition.entries()).forEach(
      ([positionId, recipients]) => {
        recipients.delete(recipient.id);

        if (recipients.size === 0) {
          this.notifiedRecipientsByPosition.delete(positionId);
        }
      },
    );

    this.walletIdToRecipientIds.get(extras.walletId)?.delete(recipient.id);

    if (this.walletIdToRecipientIds.get(extras.walletId)?.size === 0) {
      this.walletIdToRecipientIds.delete(extras.walletId);
    }
  }

  protected initMonitoring() {
    this.subscription.add(
      this.monitor
        .getWallets()
        .pipe(
          this.collectRecipientsToNotify(),
          tap((recipients) => {
            this.logger.log(`Recipients to notify:`);
            recipients.forEach((r) =>
              this.logger.log(
                `- ${r.recipientId} with positions: ${this.getPositionsIds(
                  r.positions,
                )}`,
              ),
            );
          }),
          this.notifyRecipients(),
          tap({
            error: (e) => this.logger.error('Monitor error, retrying...', e),
          }),
          retry({ delay: 1000 }),
        )
        .subscribe({
          error: (e) => this.logger.error('Monitor error:', e),
          complete: () => {
            this.logger.error('Monitor completed unexpectedly! Restarting...');
            this.initMonitoring();
          },
        }),
    );
  }

  protected collectRecipientsToNotify(): OperatorFunction<
    SaucerSwapLPWallet[],
    RecipientWithPositions[]
  > {
    return (wallets$) =>
      wallets$.pipe(
        switchMap((wallets) =>
          combineLatest(wallets.map((wallet) => wallet.positions$)),
        ),
        debounceTime(0),
        map((positions) => positions.flat()),
        map((positions) => {
          const recipients = new Map<
            string,
            RecipientWithPositions & { positionIds: Set<number> }
          >();

          positions.forEach((position) => {
            if (position.isInRange) {
              // If position was previously notified and now is in range,
              // remove it from the notified list so it can be re-notified again
              this.notifiedRecipientsByPosition.delete(position.tokenSN);
              return;
            }

            const recipientIds = Array.from(
              this.walletIdToRecipientIds.get(position.accountId) ?? [],
            );

            recipientIds
              .filter(
                (recipientId) =>
                  !this.isRecipientNotified(recipientId, position.tokenSN),
              )
              .forEach((recipientId) => {
                if (!recipients.has(recipientId)) {
                  recipients.set(recipientId, {
                    recipientId,
                    positions: [],
                    positionIds: new Set(),
                  });
                }
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const recipient = recipients.get(recipientId)!;

                if (recipient.positionIds.has(position.tokenSN)) {
                  return;
                }

                recipient.positions.push(position);
                recipient.positionIds.add(position.tokenSN);
              });
          });

          return Array.from(recipients.values()).filter(
            (recipient) => recipient.positions.length > 0,
          );
        }),
        filter((recipients) => recipients.length > 0),
      );
  }

  protected notifyRecipients(): OperatorFunction<
    RecipientWithPositions[],
    void
  > {
    return (recipients$) =>
      recipients$.pipe(
        switchMap((recipients) =>
          merge(
            ...recipients.map((recipient) => this.notifyRecipient(recipient)),
          ),
        ),
      );
  }

  protected notifyRecipient(recipient: RecipientWithPositions) {
    return defer(() => this.sendNotification(recipient)).pipe(
      catchError((e) => {
        if (e instanceof RecipientGoneError) {
          this.logger.error(
            `Recipient ${recipient.recipientId} is gone! Removing from monitoring...`,
          );
          return this.cleanupRecipient(recipient.recipientId);
        }

        return throwError(() => e);
      }),
      tap({
        error: (e) =>
          this.logger.error(
            `Failed to notify recipient ${
              recipient.recipientId
            } about out of range positions: ${this.getPositionsIds(
              recipient.positions,
            )}! Retrying...`,
            JSON.stringify(e),
          ),
      }),
      retry({
        count: this.config.notificationRetryCount ?? 5,
        delay: 1000,
        resetOnSuccess: true,
      }),
      catchError((e) => {
        this.logger.error(
          `Removing recipient ${
            recipient.recipientId
          } from monitoring due to notification failure: ${JSON.stringify(e)}`,
        );
        return this.cleanupRecipient(recipient.recipientId);
      }),
    );
  }

  protected async sendNotification(data: RecipientWithPositions) {
    const recipient = await this.notifierRegistry.findRecipient(
      data.recipientId,
    );

    if (!recipient) {
      return;
    }

    this.logger.log(
      `Notifying recipient ${
        recipient.id
      } about out of range positions: ${this.getPositionsIds(data.positions)}`,
    );

    await this.notifier.sendNotification(
      this.getNotificationData(recipient, data.positions),
    );

    data.positions.forEach((position) => {
      if (!this.notifiedRecipientsByPosition.has(position.tokenSN)) {
        this.notifiedRecipientsByPosition.set(position.tokenSN, new Set());
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.notifiedRecipientsByPosition
        .get(position.tokenSN)!
        .add(recipient.id);
    });
  }

  protected async cleanupRecipient(recipientId: string) {
    const recipient = await this.notifierRegistry.findRecipient(recipientId);

    if (!recipient) {
      return;
    }

    await this.doUnsubscribe(recipient);
  }

  protected getPositionsIds(positions: SaucerSwapLPPosition[]) {
    return positions.map((position) => position.tokenSN).join(', ');
  }

  protected dataToSubscription(
    data: SaucerSwapLPPSubscribeData,
  ): NotificationSubscription<SaucerSwapLPPWalletData> {
    return {
      ...data.subscription,
      extras: { walletId: data.walletId },
    };
  }

  protected getNotificationData(
    recipient: NotificationRecipient<SaucerSwapLPPWalletData>,
    positions: PositionWithPool[],
  ): NotificationData<SaucerSwapLPPWalletData> {
    return {
      recipient,
      payload: new SaucerSwapLPPositionsOutOfRangeEvent(positions),
    };
  }

  protected isRecipientNotified(
    recipientId: string,
    positionId: number,
  ): boolean {
    return (
      this.notifiedRecipientsByPosition.get(positionId)?.has(recipientId) ??
      false
    );
  }
}

export interface SaucerSwapLPPSubscribeData extends SaucerSwapLPPWalletData {
  subscription: NotificationSubscription<undefined>;
}

interface RecipientWithPositions {
  recipientId: string;
  positions: SaucerSwapLPPosition[];
}
