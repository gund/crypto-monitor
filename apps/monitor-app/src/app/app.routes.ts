import { Route } from '@angular/router';
import { importNgRemoteModule } from '@crypto-monitor/conventional-mf';

export interface AppRoutesConfig {
  remotes?: Record<string, string>;
}

export function appRoutes(config?: AppRoutesConfig): Route[] {
  return [
    ...Object.keys(config?.remotes ?? {}).map((path) => ({
      path,
      loadChildren: () => importNgRemoteModule(path).then((m) => m.routes),
    })),
    {
      path: '',
      loadComponent: () =>
        import('./nx-welcome.component').then((m) => m.NxWelcomeComponent),
    },
  ];
}
