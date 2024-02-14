import { PositionWithPool } from './api-interfaces';

export class SaucerSwapLPPositionsOutOfRangeEvent {
  readonly type = 'ss:lp-positions:out-of-range';
  readonly positionIds;

  constructor(positions: PositionWithPool[]) {
    this.positionIds = positions.map((p) => p.tokenSN);
  }
}
