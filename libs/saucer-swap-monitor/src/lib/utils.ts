import { PositionWithPool } from './api-interfaces';

export function getLPPositionUrl(position: PositionWithPool) {
  return `https://saucerswap.finance/liquidity/${position.pool.contractId}/my-positions/${position.tokenSN}`;
}
