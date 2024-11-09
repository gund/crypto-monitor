import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import {
  SaucerSwapApiHeadersToken,
  SaucerSwapApiToken,
} from './saucer-swap-api.token';

export function saucerSwapPushInterceptor(): HttpInterceptorFn {
  let apiUrl: string | undefined;
  let apiHeaders: Headers | undefined;

  return (req, next) => {
    if (apiUrl === undefined) {
      apiUrl = inject(SaucerSwapApiToken).toString();
      apiHeaders = inject(SaucerSwapApiHeadersToken);
    }

    if (apiHeaders !== undefined && req.url.startsWith(apiUrl)) {
      console.log('Adding headers to request', req.url, apiHeaders);
      let headers = req.headers;
      apiHeaders.forEach((value, key) => {
        headers = headers.append(key, value);
      });
      req = req.clone({ headers });
    }

    return next(req);
  };
}
