import { filter, firstValueFrom, timeout } from 'rxjs';
import { SWManager } from './sw-manager';

export class NGSWPingPong {
  protected readonly pingMsg = this.messenger.createPing();
  protected readonly pong$ = this.swManager.messages.pipe(
    filter((event): event is MessageEvent<NGSWPPMessengerPong> =>
      this.messenger.isPong(event.data),
    ),
  );

  constructor(
    protected readonly swManager: SWManager,
    protected readonly messenger = NGSWPPMessenger,
    protected readonly pingTimeout = 5000,
  ) {}

  async ping(): Promise<void> {
    const sw = await this.swManager.getActiveSW();
    const pong = firstValueFrom(this.pong$.pipe(timeout(this.pingTimeout)));

    sw.postMessage(this.pingMsg);

    await pong;
  }
}

export type NGSWPPMessengerPing = `${string}:ping`;
export type NGSWPPMessengerPong = `${string}:pong`;

export class NGSWPPMessenger {
  static PREFIX = 'ngsw';

  static createPing(): NGSWPPMessengerPing {
    return `${this.PREFIX}:ping`;
  }

  static isPing(message: unknown): message is NGSWPPMessengerPing {
    return typeof message === 'string' && message === `${this.PREFIX}:ping`;
  }

  static createPong(): NGSWPPMessengerPong {
    return `${this.PREFIX}:pong`;
  }

  static isPong(message: unknown): message is NGSWPPMessengerPong {
    return typeof message === 'string' && message === `${this.PREFIX}:pong`;
  }
}
