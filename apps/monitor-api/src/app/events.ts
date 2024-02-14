import {
  PositionWithPool,
  getLPPositionUrl,
} from '@crypto-monitor/saucer-swap-monitor';

export class SSLPPOutOfRangeNotification {
  protected static MaxPositions = 4;

  readonly tag = 'ss:lpp:out-of-range';
  readonly title;
  readonly body;
  readonly actions;
  readonly data;

  constructor(positions: PositionWithPool[]) {
    this.title = this.getTitle(positions);
    this.body = this.getBody(positions);
    this.actions = this.getActions(positions);
    this.data = this.getData(positions);
  }

  protected getPositionNames(positions: PositionWithPool[]) {
    let names = positions
      .slice(0, SSLPPOutOfRangeNotification.MaxPositions)
      .map(
        (position) => `${position.token0?.symbol}/${position.token1?.symbol}`,
      )
      .join(', ');

    if (positions.length > SSLPPOutOfRangeNotification.MaxPositions) {
      names += ` and ${
        positions.length - SSLPPOutOfRangeNotification.MaxPositions
      } more`;
    }

    return names;
  }

  protected getTitle(positions: PositionWithPool[]) {
    return positions.length === 1
      ? `${this.getPositionNames(positions)} position is out of range!`
      : `Multiple SaucerSwap LP positions are out of range!`;
  }

  protected getBody(positions: PositionWithPool[]) {
    const positionNames = this.getPositionNames(positions);

    return positions.length === 1
      ? `Your SaucerSwap LP position ${positionNames} is out of range!`
      : `Your SaucerSwap LP positions ${positionNames} are out of range!`;
  }

  protected getActions(positions: PositionWithPool[]) {
    if (positions.length !== 1) {
      return;
    }

    return [{ action: 'managePosition', title: 'Manage Position' }];
  }

  protected getData(positions: PositionWithPool[]) {
    if (positions.length !== 1) {
      return;
    }

    return {
      onActionClick: {
        default: { operation: 'focusLastFocusedOrOpen', url: '/' },
        managePosition: {
          operation: 'openWindow',
          url: getLPPositionUrl(positions[0]),
        },
      },
    };
  }
}
