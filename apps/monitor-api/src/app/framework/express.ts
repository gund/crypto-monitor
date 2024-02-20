import {
  ExecutionContext,
  Inject,
  Injectable,
  Module,
  Scope,
} from '@nestjs/common';
import { Request } from 'express';
import { FrameworkRequest, provideFrameworkRequest } from './request';
import { FrameworkResponse, provideFrameworkResponse } from './response';
import {
  FrameworkExecutionContext,
  provideFrameworkExecutionContext,
} from './execution-context';

@Injectable({ scope: Scope.REQUEST })
export class ExpressFramework implements FrameworkRequest, FrameworkResponse {
  constructor(@Inject('REQUEST') public req: Request) {}
  getUrl(): string {
    return this.req.originalUrl;
  }
  getMethod(): string {
    return this.req.method;
  }
  getHostname(): string {
    return this.req.hostname;
  }
  getIp(): string {
    return this.req.ip ?? '';
  }
  setHeader(name: string, value: string | readonly string[]): this {
    this.req.res?.setHeader(name, value);
    return this;
  }
}

@Injectable()
export class ExpressFrameworkExecutionContext
  implements FrameworkExecutionContext
{
  getRequest(context: ExecutionContext) {
    return new ExpressFramework(context.switchToHttp().getRequest());
  }
  getResponse(context: ExecutionContext) {
    return this.getRequest(context);
  }
}

@Module({
  providers: [
    provideFrameworkRequest(ExpressFramework),
    provideFrameworkResponse(ExpressFramework),
    provideFrameworkExecutionContext(ExpressFrameworkExecutionContext),
  ],
  exports: [FrameworkRequest, FrameworkResponse, FrameworkExecutionContext],
})
export class ExpressFrameworkModule {}
