import {
  ExecutionContext,
  InjectionToken,
  Provider,
  Type,
} from '@nestjs/common';
import { FrameworkRequest } from './request';
import { FrameworkResponse } from './response';

export interface FrameworkExecutionContext<TContext = ExecutionContext> {
  getRequest(context: TContext): FrameworkRequest;
  getResponse(context: TContext): FrameworkResponse;
}

export const FrameworkExecutionContext: InjectionToken<FrameworkExecutionContext> =
  Symbol('FrameworkExecutionContext');

export function provideFrameworkExecutionContext(
  context: Type<FrameworkExecutionContext>,
): Provider {
  return {
    provide: FrameworkExecutionContext,
    useClass: context,
  };
}
