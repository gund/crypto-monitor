import {
  APP_INITIALIZER,
  Inject,
  Injectable,
  InjectionToken,
  Provider,
  Type,
} from '@angular/core';

export interface OnAppInit {
  onAppInit(): void | Promise<void>;
}

@Injectable({ providedIn: 'root' })
export class AppInitService implements OnAppInit {
  private isRunning = false;

  constructor(@Inject(AppInitToken) private readonly initables: OnAppInit[]) {}

  async onAppInit() {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;

    await Promise.all(this.initables.map((initable) => initable.onAppInit()));
  }
}

export const AppInitToken = new InjectionToken<OnAppInit[]>('AppInitToken');

export function provideAppInit(...initables: Type<OnAppInit>[]): Provider[] {
  return [
    {
      provide: APP_INITIALIZER,
      useFactory: (appInitService: AppInitService) => () =>
        appInitService.onAppInit(),
      deps: [AppInitService],
      multi: true,
    },
    ...initables.map((initable) => ({
      provide: AppInitToken,
      useExisting: initable,
      multi: true,
    })),
  ];
}
