import { bootstrapApplication } from '@angular/platform-browser';
import { AppConfig, appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

export function boot(config?: AppConfig) {
  return bootstrapApplication(AppComponent, appConfig(config));
}
