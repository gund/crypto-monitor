import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppConfigService } from '../app-config/config.service';
import { FrameworkExecutionContext, FrameworkRequest } from '../framework';
import {
  Deprecation,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  DeprecationMetadata,
  DeprecationReplacement,
} from './decorator';

/**
 * Guard that adds deprecation headers to the response and logs a warning.
 * Use the \@{@link Deprecation()} decorator to mark a controller/method as deprecated.
 *
 * NOTE: Will block the request if {@link DeprecationMetadata.removeBy} date is defined and has passed.
 *
 * @see {@link https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-deprecation-header | Deprecation HTTP Header RFC Draft}
 * @see {@link https://datatracker.ietf.org/doc/html/rfc8594 | Sunset HTTP Header RFC}
 */
@Injectable()
export class DeprecationGuard implements CanActivate {
  private readonly logger = new Logger('DeprecationGuard');

  constructor(
    private readonly reflector: Reflector,
    private readonly appConfigService: AppConfigService,
    @Inject(FrameworkExecutionContext)
    private readonly context: FrameworkExecutionContext,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const deprecation = this.reflector.getAllAndOverride(Deprecation, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!deprecation) {
      return true;
    }

    const req = this.context.getRequest(context);
    const reqName = this.getRequestName(req);
    const reqInfo = `${reqName} by ${this.getRequestSource(req)}`;

    this.logger.warn(`Call to a deprecated API: ${reqInfo}`);

    if (deprecation.removeBy && deprecation.removeBy <= new Date()) {
      this.logger.warn(`Blocked call to a deprecated API: ${reqInfo}`);

      throw new NotFoundException(`Cannot ${reqName}`);
    }

    const res = this.context.getResponse(context);

    res.setHeader('Deprecation', this.getDeprecationTime(deprecation.since));

    if (deprecation.replacedBy) {
      res.setHeader('Link', this.getReplacementLink(deprecation.replacedBy));
    }

    if (deprecation.removeBy) {
      res.setHeader('Sunset', this.getSunsetDate(deprecation.removeBy));
    }

    return true;
  }

  private getRequestName(req: FrameworkRequest) {
    return `${req.getMethod()} ${req.getUrl()}`;
  }

  private getRequestSource(req: FrameworkRequest) {
    return `${req.getHostname()} [${req.getIp()}]`;
  }

  /** Deprecation time is in seconds since epoch */
  private getDeprecationTime(since = new Date()) {
    return `@${Math.ceil(since.getTime() / 1000)}`;
  }

  /** Sunset date is in UTC format */
  private getSunsetDate(removeBy: Date) {
    return removeBy.toUTCString();
  }

  private getReplacementLink(replacedBy: DeprecationReplacement) {
    const link = replacedBy.link.startsWith('http')
      ? replacedBy.link
      : new URL(replacedBy.link, this.appConfigService.publicUrl).toString();
    const type = replacedBy.type ?? 'text/html';

    return `<${link}>; rel="deprecation"; type="${type}"`;
  }
}
