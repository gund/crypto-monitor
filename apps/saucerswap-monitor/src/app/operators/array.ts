/* eslint-disable @typescript-eslint/no-explicit-any */
import { distinctUntilChanged, map, Observable, OperatorFunction } from 'rxjs';

export const some = arrayOperator('some');
export const every = arrayOperator('every');

type AsCallable<T> = T extends (...args: any[]) => any ? T : never;
type OnlyCallable<T> = {
  [P in keyof T as T[P] extends (...args: any[]) => any
    ? P
    : never]: AsCallable<T[P]>;
};
type ArrayCallable<T> = OnlyCallable<Array<T>>;

function arrayOperator<K extends keyof ArrayCallable<any>>(
  key: K,
  shouldDistinct = true,
): <T>(
  ...args: Parameters<AsCallable<Array<T>[K]>>
) => OperatorFunction<T[], boolean> {
  const operation = Array.prototype[key] as AsCallable<Array<any>[K]>;
  const primary = (source$: Observable<any[]>, args: unknown[]) =>
    source$.pipe(map((items) => operation.apply(items, args)));
  const op = shouldDistinct
    ? (source$: Observable<any[]>, args: unknown[]) =>
        primary(source$, args).pipe(distinctUntilChanged())
    : (source$: Observable<any[]>, args: unknown[]) => primary(source$, args);

  return (...args) =>
    (source$) =>
      op(source$, args);
}
