import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideAppInit } from './app-init.service';
import { appRoutes } from './app.routes';
import { SaucerSwapLPPService } from './saucer-swap-lpp.service';
import { saucerSwapPushInterceptor } from './sauser-swap-push.interceptor';
import { SSWalletStorageService } from './ss-wallet-storage.service';
import { SWChannelService } from './sw-channel.service';
import { UpdateService } from './update.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([saucerSwapPushInterceptor()])),
    provideRouter(appRoutes),
    provideServiceWorker('/service-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    ...provideAppInit(
      UpdateService,
      SaucerSwapLPPService,
      SSWalletStorageService,
      SWChannelService,
    ),
  ],
};
