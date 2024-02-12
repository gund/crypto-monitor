import { Pipe, PipeTransform } from '@angular/core';
import { SaucerSwapLPPosition } from '@crypto-monitor/saucer-swap-monitor';

@Pipe({
  name: 'positionsSummary',
  standalone: true,
  pure: true,
})
export class PositionsSummaryPipe implements PipeTransform {
  transform(positions?: SaucerSwapLPPosition[] | null): string {
    if (!positions?.length) {
      return '0 positions';
    }

    const inRange = positions.filter((position) => position.isInRange).length;
    const outOfRange = positions.length - inRange;

    const inRangeText = inRange > 0 ? `${inRange} position(s) in range` : '';
    const outOfRangeText =
      outOfRange > 0 ? `${outOfRange} position(s) out of range` : '';
    const separator = inRangeText && outOfRangeText ? ' and ' : '';

    return `${inRangeText}${separator}${outOfRangeText}`;
  }
}
