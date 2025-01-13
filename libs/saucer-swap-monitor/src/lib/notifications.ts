import {
  NGSWNotification,
  NGSWNotificationActionOperationType,
} from '@crypto-monitor/ngsw-notifications';
import { PositionWithPool } from './api-interfaces';
import { getLPPositionUrl } from './utils';

export interface SSLPPOutOfRangeNotificationMeta {
  positions: PositionWithPool[];
}

export class SSLPPOutOfRangeNotification extends NGSWNotification<
  SSLPPOutOfRangeNotificationMeta,
  'managePosition'
> {
  protected static MaxPositions = 4;

  readonly tag = 'ss:lpp:out-of-range';

  protected getTitle() {
    return this.meta.positions.length === 1
      ? `${this.getPositionNames()} position is out of range!`
      : `Multiple SaucerSwap LP positions are out of range!`;
  }

  protected override getBody() {
    const positionNames = this.getPositionNames();

    return this.meta.positions.length === 1
      ? `Your SaucerSwap LP position ${positionNames} is out of range!`
      : `Your SaucerSwap LP positions ${positionNames} are out of range!`;
  }

  protected override getActions() {
    if (this.meta.positions.length !== 1) {
      return;
    }

    return [{ action: 'managePosition', title: 'Manage Position' }] as const;
  }

  protected override getData() {
    if (this.meta.positions.length !== 1) {
      return;
    }

    return {
      onActionClick: {
        default: {
          operation:
            NGSWNotificationActionOperationType.NavigateLastFocusedOrOpen,
          url: '/',
        },
        managePosition: {
          operation: NGSWNotificationActionOperationType.OpenWindow,
          url: getLPPositionUrl(this.meta.positions[0]),
        },
      },
    };
  }

  protected getPositionNames() {
    let names = this.meta.positions
      .slice(0, SSLPPOutOfRangeNotification.MaxPositions)
      .map(
        (position) => `${position.token0?.symbol}/${position.token1?.symbol}`,
      )
      .join(', ');

    if (this.meta.positions.length > SSLPPOutOfRangeNotification.MaxPositions) {
      names += ` and ${
        this.meta.positions.length - SSLPPOutOfRangeNotification.MaxPositions
      } more`;
    }

    return names;
  }
}

export interface SSLPPInRangeNotificationMeta {
  walletCount: number;
}

export class SSLPPInRangeNotification extends NGSWNotification<SSLPPInRangeNotificationMeta> {
  readonly tag = 'ss:lpp:in-range';

  protected getTitle() {
    return 'All your SaucerSwap LP positions are in range!';
  }

  protected override getBody() {
    return `Checked ${this.meta.walletCount} wallet${
      this.meta.walletCount > 1 ? 's' : ''
    }.`;
  }

  protected override getData() {
    return {
      onActionClick: {
        default: {
          operation:
            NGSWNotificationActionOperationType.NavigateLastFocusedOrOpen,
          url: '/',
        },
      },
    };
  }
}
