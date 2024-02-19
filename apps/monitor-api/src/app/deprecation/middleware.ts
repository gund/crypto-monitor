import { Injectable, Logger, NestMiddleware, Scope } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class DeprecationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    Logger.warn(
      `Call to a deprecated API ${req.method} ${req.originalUrl}`,
      'Deprecation warning',
    );
    Logger.debug(req);
    next();
  }
}
