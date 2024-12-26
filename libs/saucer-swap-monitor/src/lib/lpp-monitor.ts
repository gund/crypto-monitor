import type { UrlMonitor, UrlMonitorRef } from '@crypto-monitor/url-monitor';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  OperatorFunction,
  combineLatest,
  debounceTime,
  map,
  retry,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import {
  ApiLiquidityPoolV2,
  ApiNftPositionV2,
  PositionWithPool,
} from './api-interfaces';
import { Logger } from './logger';
import { SSPositionMonitorRef } from './position-monitor-ref';

export interface SaucerSwapLPPMonitorConfig {
  walletMonitor: UrlMonitor;
  poolMonitor?: UrlMonitor;
  retryDelayMs?: number;
  logger?: Logger;
}

export class SaucerSwapLPPMonitor {
  protected readonly walletMonitor = this.config.walletMonitor;
  protected readonly poolMonitor =
    this.config.poolMonitor ?? this.walletMonitor;
  protected readonly logger = this.config.logger || console;

  protected readonly poolRef$ = new BehaviorSubject<
    UrlMonitorRef<ApiLiquidityPoolV2[]> | undefined
  >(undefined);
  protected readonly walletRefs$ = new BehaviorSubject<SSPositionMonitorRef[]>(
    [],
  );

  protected readonly pools$ = this.poolRef$.pipe(
    this.poolsToMap(),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  protected readonly wallets$ = this.walletRefs$.pipe(
    this.positionsToWallets(),
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
    return new SSPositionMonitorRef(
      data.walletId,
      await this.walletMonitor.start<ApiNftPositionV2[]>({
        url: `https://api.saucerswap.finance/V2/nfts/${data.walletId}/positions`,
        selector: (response) => response.json(),
      }),
    );
  }

  protected monitorPools() {
    return this.poolMonitor.start<ApiLiquidityPoolV2[]>({
      url: 'https://api.saucerswap.finance/v2/pools',
      selector: (response) => response.json(),
    });
  }

  protected poolsToMap(): OperatorFunction<
    UrlMonitorRef<ApiLiquidityPoolV2[]> | undefined,
    Map<string, ApiLiquidityPoolV2>
  > {
    return (ref$) =>
      ref$.pipe(
        switchMap((ref) =>
          ref
            ? ref.data.pipe(
                tap({
                  error: (e) =>
                    this.logger.error(
                      'Failed to update pool data, retrying...',
                      e,
                    ),
                }),
                retry({ delay: this.config.retryDelayMs ?? 1000 }),
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
      );
  }

  protected positionsToWallets(): OperatorFunction<
    SSPositionMonitorRef[],
    SaucerSwapLPWallet[]
  > {
    return (positions$) =>
      positions$.pipe(
        map((positions) =>
          positions.map((position) => {
            const activePositions$ = position.data.pipe(
              tap({
                error: (e) =>
                  this.logger.error(
                    'Failed to update positions, retrying...',
                    e,
                  ),
              }),
              retry({ delay: this.config.retryDelayMs ?? 1000 }),
              map((positions) =>
                positions.filter((position) => !position.deleted),
              ),
            );

            const positions$ = combineLatest([
              this.pools$,
              activePositions$,
            ]).pipe(
              debounceTime(0),
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

            return {
              walletId: position.walletId,
              positions$,
            };
          }),
        ),
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
