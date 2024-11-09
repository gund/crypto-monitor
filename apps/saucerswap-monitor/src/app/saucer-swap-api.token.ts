import { InjectionToken } from '@angular/core';

export const SaucerSwapApiToken = new InjectionToken('SaucerSwapApi', {
  providedIn: 'root',
  factory: () => new URL(process.env.SSM_API_URL ?? 'http://localhost:3000'),
});

export const SaucerSwapApiHeadersToken = new InjectionToken(
  'SaucerSwapApiHeaders',
  {
    providedIn: 'root',
    factory: () => {
      let headers: Headers | undefined;

      const headersString = process.env.SSM_API_HEADERS;
      if (headersString) {
        try {
          headers = new Headers(JSON.parse(headersString));
        } catch (error) {
          console.error(
            `Failed to parse SSM_API_HEADERS: ${headersString}`,
            error,
          );
        }
      }

      return headers;
    },
  },
);
