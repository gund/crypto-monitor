import { Route } from '@angular/router';
import { loadRemoteModule } from '@nx/angular/mf';

export interface AppRoutesConfig {
  remotes?: Record<string, string>;
}

export function appRoutes(config?: AppRoutesConfig): Route[] {
  return [
    ...Object.keys(config?.remotes ?? {}).map((path) => ({
      path,
      loadChildren: () =>
        loadRemoteModule(path, './remote-entry').then((m) => m.remoteRoutes),
    })),
    {
      path: '',
      loadComponent: () =>
        import('./nx-welcome.component').then((m) => m.NxWelcomeComponent),
    },
  ];
}
