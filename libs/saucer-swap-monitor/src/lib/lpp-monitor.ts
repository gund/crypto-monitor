import type { UrlMonitor, UrlMonitorRef } from '@crypto-monitor/url-monitor';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  catchError,
  combineLatest,
  map,
  shareReplay,
  switchMap,
} from 'rxjs';
import {
  ApiLiquidityPoolV2,
  ApiNftPositionV2,
  PositionWithPool,
} from './api-interfaces';
import { SaucerSwapMonitorRef } from './monitor-ref';
import { Logger } from './logger';

export interface SaucerSwapLPPMonitorConfig {
  monitor: UrlMonitor;
  poolsPollIntervalMs?: number;
  logger?: Logger;
}

export class SaucerSwapLPPMonitor {
  protected readonly monitor = this.config.monitor;
  protected readonly logger = this.config.logger || console;

  protected readonly poolRef$ = new BehaviorSubject<
    UrlMonitorRef<ApiLiquidityPoolV2[]> | undefined
  >(undefined);
  protected readonly walletRefs$ = new BehaviorSubject<SaucerSwapMonitorRef[]>(
    [],
  );

  protected readonly pools$ = this.poolRef$.pipe(
    switchMap((ref) =>
      ref
        ? ref.data.pipe(
            catchError((e) => {
              this.logger.error('Failed to update pool data:', e);
              return EMPTY;
            }),
          )
        : EMPTY,
    ),
    map(
      (pools) =>
        new Map(
          pools.flatMap((pool) => [
            [this.poolHash(pool), pool],
            [this.poolHashRev(pool), pool],
          ]),
        ),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  protected readonly wallets$ = this.walletRefs$.pipe(
    map((refs) =>
      refs.map(
        (wallet) =>
          ({
            walletId: wallet.walletId,
            positions$: this.addPoolToPositions(wallet.data),
          } as SaucerSwapLPWallet),
      ),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  constructor(protected readonly config: SaucerSwapLPPMonitorConfig) {}

  async init(initialData: SaucerSwapLPPWalletData[] = []) {
    const walletIds = initialData.map((data) => data.walletId);

    const refs = await Promise.all(
      walletIds.map((walletId) => this.monitorWallet({ walletId })),
    );

    this.walletRefs$.next(refs);

    if (refs.length > 0) {
      this.poolRef$.next(await this.monitorPools());
    }
  }

  async dispose() {
    await Promise.all([
      this.poolRef$.getValue()?.stop(),
      ...this.walletRefs$.getValue().map((ref) => ref.stop()),
    ]);
    this.poolRef$.complete();
    this.walletRefs$.complete();
  }

  getWallets(): Observable<SaucerSwapLPWallet[]> {
    return this.wallets$;
  }

  async start(data: SaucerSwapLPPWalletData) {
    if (
      this.walletRefs$.getValue().some((ref) => ref.walletId === data.walletId)
    ) {
      return;
    }

    const ref = await this.monitorWallet(data);

    if (this.poolRef$.getValue() === undefined) {
      this.poolRef$.next(await this.monitorPools());
    }

    this.walletRefs$.next([...this.walletRefs$.getValue(), ref]);
  }

  async stop(data: SaucerSwapLPPWalletData) {
    await Promise.all(
      this.walletRefs$
        .getValue()
        .filter((ref) => ref.walletId === data.walletId)
        .map((ref) => ref.stop()),
    );

    this.walletRefs$.next(
      this.walletRefs$
        .getValue()
        .filter((ref) => ref.walletId !== data.walletId),
    );

    if (this.walletRefs$.getValue().length === 0) {
      this.poolRef$.getValue()?.stop();
      this.poolRef$.next(undefined);
    }
  }

  protected async monitorWallet(data: SaucerSwapLPPWalletData) {
    return new SaucerSwapMonitorRef(
      data.walletId,
      await this.monitor.start({
        url: `https://api.saucerswap.finance/V2/nfts/${data.walletId}/positions`,
        selector: (response) => response.json() as Promise<ApiNftPositionV2[]>,
      }),
    );
  }

  protected monitorPools() {
    return this.monitor.start({
      url: 'https://api.saucerswap.finance/v2/pools',
      pollIntervalMs: this.config.poolsPollIntervalMs,
      selector: (response) => response.json() as Promise<ApiLiquidityPoolV2[]>,
    });
  }

  protected addPoolToPositions(
    positions$: Observable<ApiNftPositionV2[]>,
  ): Observable<SaucerSwapLPPosition[]> {
    const activePositions$ = positions$.pipe(
      catchError((e) => {
        this.logger.error('Failed to update positions:', e);
        return EMPTY;
      }),
      map((positions) => positions.filter((position) => !position.deleted)),
    );

    return combineLatest([this.pools$, activePositions$]).pipe(
      map(([pools, positions]) =>
        positions.flatMap((position) => {
          const pool = pools.get(this.positionPoolHash(position));

          if (!pool) {
            this.logger.error(
              `Could not find pool for position ${
                position.tokenSN
              } with hash ${this.positionPoolHash(position)}`,
            );
            return [];
          }

          return [
            {
              ...position,
              pool,
              isInRange: this.isPositionInRange(position, pool),
            },
          ];
        }),
      ),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  protected poolHash(pool: ApiLiquidityPoolV2): string {
    return `${pool.tokenA.id}:${pool.tokenB.id}`;
  }

  protected poolHashRev(pool: ApiLiquidityPoolV2): string {
    return `${pool.tokenB.id}:${pool.tokenA.id}`;
  }

  protected positionPoolHash(position: ApiNftPositionV2): string {
    return `${position.token0?.id}:${position.token1?.id}`;
  }

  protected isPositionInRange(
    position: ApiNftPositionV2,
    pool: ApiLiquidityPoolV2,
  ) {
    return (
      pool.tickCurrent > position.tickLower &&
      pool.tickCurrent < position.tickUpper
    );
  }
}

export interface SaucerSwapLPPWalletData {
  walletId: string;
}

export interface SaucerSwapLPWallet {
  walletId: string;
  positions$: Observable<SaucerSwapLPPosition[]>;
}

export interface SaucerSwapLPPosition extends PositionWithPool {
  isInRange: boolean;
}
