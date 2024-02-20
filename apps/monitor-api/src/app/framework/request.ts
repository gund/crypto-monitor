import { InjectionToken, Provider, Type } from '@nestjs/common';

export interface FrameworkRequest {
  getUrl(): string;
  getMethod(): string;
  getHostname(): string;
  getIp(): string;
}

export const FrameworkRequest: InjectionToken<FrameworkRequest> =
  Symbol('FrameworkRequest');

export function provideFrameworkRequest(
  request: Type<FrameworkRequest>,
): Provider {
  return {
    provide: FrameworkRequest,
    useClass: request,
  };
}
