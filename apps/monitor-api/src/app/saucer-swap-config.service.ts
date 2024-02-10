import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends SaucerSwapConfigEnv {}
  }
}

export interface SaucerSwapConfigEnv {
  VAPID_PUBLIC_KEY: string;
  VAPID_PRIVATE_KEY: string;
  VAPID_EMAIL?: string;
  NOTIFIER_STORAGE_PATH?: string;
  POSITIONS_POLL_INTERVAL_MS?: number;
  POOLS_POLL_INTERVAL_MS?: number;
}

@Injectable()
export class SaucerSwapConfigService {
  readonly notifierNamespaceUUID = '3336e090-b61c-4e54-8dd5-1abe2b753779';

  readonly positionsPollIntervalMs = this.configService.get(
    'POSITIONS_POLL_INTERVAL_MS',
    1000 * 60 * 5,
    { infer: true }
  );
  readonly poolsPollIntervalMs = this.configService.get(
    'POOLS_POLL_INTERVAL_MS',
    1000 * 60,
    { infer: true }
  );
  readonly notifierStoragePath = this.configService.get(
    'NOTIFIER_STORAGE_PATH',
    './data/ss-notifier-db',
    { infer: true }
  );
  readonly vapidEmail = this.configService.get(
    'VAPID_EMAIL',
    'test@localhost',
    { infer: true }
  );
  readonly vapidPublicKey = this.configService.getOrThrow('VAPID_PUBLIC_KEY', {
    infer: true,
  });
  vapidPrivateKey = this.configService.getOrThrow('VAPID_PRIVATE_KEY', {
    infer: true,
  });

  constructor(private configService: ConfigService<SaucerSwapConfigEnv>) {}

  dispose() {
    this.vapidPrivateKey = '';
    process.env.VAPID_PRIVATE_KEY = '';
  }
}
