import { map, OperatorFunction } from 'rxjs';

export function toVoid(): OperatorFunction<unknown, void> {
  return (source$) => source$.pipe(map(() => undefined));
}
