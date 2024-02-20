import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppConfigService } from '../app-config/config.service';
import { FrameworkExecutionContext } from '../framework';
import { Deprecation } from './decorator';

/**
 * Guard to add deprecation warning headers to the response and log a warning.
 *
 * Use the \@{@link Deprecation()} decorator to mark a controller or method as deprecated.
 *
 * RFC: https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-deprecation-header
 */
@Injectable()
export class DeprecationGuard implements CanActivate {
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
    const res = this.context.getResponse(context);

    Logger.warn(
      `Call to a deprecated API: ${req.getMethod()} ${req.getUrl()} by ${req.getHostname()} [${req.getIp()}]`,
      'Deprecation warning',
    );

    // Deprecation date in seconds since epoch
    res.setHeader(
      'Deprecation',
      `@${(deprecation.since ?? new Date()).getTime() / 1000}`,
    );

    if (deprecation.replacedBy) {
      const link = this.resolveLink(deprecation.replacedBy.link);

      res.setHeader(
        'Link',
        `<${link}>; rel="deprecation"; type="${
          deprecation.replacedBy.type ?? 'text/html'
        }"`,
      );
    }

    if (deprecation.removeBy) {
      // Sunset date in UTC format
      res.setHeader('Sunset', `${deprecation.removeBy.toUTCString()}`);
    }

    return true;
  }

  private resolveLink(link: string): string {
    if (link.startsWith('http')) {
      return link;
    }

    return new URL(link, this.appConfigService.publicUrl).toString();
  }
}
