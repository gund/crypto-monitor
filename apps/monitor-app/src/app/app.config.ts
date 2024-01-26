import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { AppRoutesConfig, appRoutes } from './app.routes';

export interface AppConfig {
  routes?: AppRoutesConfig;
}

export function appConfig(config?: AppConfig): ApplicationConfig {
  return {
    providers: [
      provideAnimationsAsync(),
      provideRouter(appRoutes(config?.routes)),
    ],
  };
}
