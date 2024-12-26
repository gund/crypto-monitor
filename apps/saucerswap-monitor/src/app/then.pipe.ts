import { NgModule, Pipe, PipeTransform } from '@angular/core';

export interface ThenContext<T> {
  condition: boolean;
  then: T;
}

@Pipe({ name: 'then', standalone: true, pure: true })
export class ThenPipe implements PipeTransform {
  transform<T>(value: unknown, truthy: T): ThenContext<T> {
    return { condition: !!value, then: truthy };
  }
}

@Pipe({ name: 'neht', standalone: true, pure: true })
export class NehtPipe implements PipeTransform {
  transform<T>(ctx: ThenContext<T>): T | null {
    return ctx.condition ? ctx.then : null;
  }
}

@Pipe({ name: 'else', standalone: true, pure: true })
export class ElsePipe implements PipeTransform {
  transform<E, T>(ctx: ThenContext<T>, falsy: E): T | E {
    return ctx.condition ? ctx.then : falsy;
  }
}

@NgModule({
  imports: [ThenPipe, NehtPipe, ElsePipe],
  exports: [ThenPipe, NehtPipe, ElsePipe],
})
export class ThenModule {}
