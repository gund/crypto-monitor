import { InjectionToken } from '@angular/core';

export const SaucerSwapApiToken = new InjectionToken('SaucerSwapApi', {
  providedIn: 'root',
  factory: () => new URL(process.env.SSM_API_URL ?? 'http://localhost:3000'),
});
