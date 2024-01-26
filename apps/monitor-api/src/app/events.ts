import {
  PositionWithPool,
  getLPPositionUrl,
} from '@crypto-monitor/saucer-swap-monitor';

export class SSLPPOutOfRangeNotification {
  readonly title: string;
  readonly body: string;
  readonly tag: string;
  readonly data: object;
  readonly actions = [{ action: 'managePosition', title: 'Manage Position' }];

  constructor(position: PositionWithPool) {
    const positionName = `${position.token0?.symbol}/${position.token1?.symbol}`;

    this.title = `${positionName} position is out of range!`;
    this.body = `Your SaucerSwap LP position ${positionName} is out of range!`;
    this.tag = `ss:lpp:out-of-range:${position.tokenSN}`;
    this.data = {
      onActionClick: {
        default: { operation: 'focusLastFocusedOrOpen', url: '/' },
        managePosition: {
          operation: 'openWindow',
          url: getLPPositionUrl(position),
        },
      },
    };
  }
}
