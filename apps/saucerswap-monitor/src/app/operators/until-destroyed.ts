import { DestroyRef, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable()
export class UntilDestroyed {
  constructor(private readonly destroyRef: DestroyRef) {}

  untilDestroyed<T>() {
    return takeUntilDestroyed<T>(this.destroyRef);
  }
}
