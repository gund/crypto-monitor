export interface ApiLiquidityPoolV2 {
  id: number;
  contractId: string;
  tokenA: ApiToken;
  /** Total amount for tokenA, in smallest unit */
  amountA: string;
  tokenB: ApiToken;
  /** Total amount for tokenB, in smallest unit */
  amountB: string;
  fee: number;
  sqrtRatioX96: string;
  tickCurrent: number;
  liquidity: string;
}

export interface ApiNftPositionV2 {
  tokenSN: number;
  accountId: string;
  token0?: ApiToken;
  token1?: ApiToken;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: number;
  feeGrowthInside0LastX128: number;
  feeGrowthInside1LastX128: number;
  tokensOwed0: number;
  tokensOwed1: number;
  createdAt: number;
  updatedAt: number;
  lastSyncedAt: number;
  deleted: boolean;
}

export interface ApiToken {
  decimals: number;
  icon?: string;
  id: string;
  name: string;
  price: string;
  priceUsd: number;
  symbol: string;
  dueDiligenceComplete: boolean;
  isFeeOnTransferToken: boolean;
  timestampSecondsLastListingChange: number;
  description: string | null;
  website: string | null;
  twitterHandle: string | null;
  sentinelReport: string | null;
}

export interface PositionWithPool extends ApiNftPositionV2 {
  pool: ApiLiquidityPoolV2;
}
