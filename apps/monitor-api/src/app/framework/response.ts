import { InjectionToken, Provider, Type } from '@nestjs/common';

export interface FrameworkResponse {
  setHeader(name: string, value: string | readonly string[]): this;
}

export const FrameworkResponse: InjectionToken<FrameworkResponse> =
  Symbol('FrameworkResponse');

export function provideFrameworkResponse(
  response: Type<FrameworkResponse>,
): Provider {
  return {
    provide: FrameworkResponse,
    useClass: response,
  };
}
