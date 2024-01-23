import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AppRoutesConfig, appRoutes } from './app.routes';

export interface AppConfig {
  routes?: AppRoutesConfig;
}

export function appConfig(config?: AppConfig): ApplicationConfig {
  return {
    providers: [provideRouter(appRoutes(config?.routes))],
  };
}
