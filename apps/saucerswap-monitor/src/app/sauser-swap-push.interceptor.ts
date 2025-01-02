import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import {
  SaucerSwapApiHeadersToken,
  SaucerSwapApiToken,
} from './saucer-swap-api.token';

export function saucerSwapPushInterceptor(): HttpInterceptorFn {
  let interceptorFn: HttpInterceptorFn = (...args) => {
    const apiUrl = inject(SaucerSwapApiToken).toString();
    const apiHeaders = inject(SaucerSwapApiHeadersToken);

    if (apiHeaders === undefined) {
      interceptorFn = (req, next) => next(req);
    } else {
      interceptorFn = (req, next) => {
        if (req.url.startsWith(apiUrl)) {
          let headers = req.headers;
          apiHeaders.forEach((value, key) => {
            headers = headers.append(key, value);
          });
          req = req.clone({ headers });
        }

        return next(req);
      };
    }

    return interceptorFn(...args);
  };

  return (req, next) => interceptorFn(req, next);
}
