import { PositionWithPool } from './api-interfaces';

export class SaucerSwapLPPOutOfRangeEvent {
  readonly type = 'ss:lpp:out-of-range';
  readonly positionId;
  readonly poolId;

  constructor(position: PositionWithPool) {
    this.positionId = position.tokenSN;
    this.poolId = position.pool.id;
  }
}
