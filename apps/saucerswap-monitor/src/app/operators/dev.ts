import { isDevMode } from '@angular/core';
import { EMPTY, of, MonoTypeOperatorFunction, identity, endWith } from 'rxjs';

/** Start with empty observable in dev mode, otherwise with `null` */
export const devNull$ = isDevMode() ? EMPTY : of(null);

/** Skip observable in dev mode */
export function skipInDev<T>(): MonoTypeOperatorFunction<T> {
  return (source$) => source$.pipe(isDevMode() ? () => EMPTY : identity);
}

/** Complete observable in dev mode */
export function endWithInDev<T extends void>(): MonoTypeOperatorFunction<T>;
export function endWithInDev<T>(value: T): MonoTypeOperatorFunction<T>;
export function endWithInDev(
  value?: unknown,
): MonoTypeOperatorFunction<unknown> {
  return (source$) => source$.pipe(isDevMode() ? endWith(value) : identity);
}
