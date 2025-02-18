import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'wallet-positions',
  },
  {
    path: 'empty',
    loadComponent: () =>
      import('./primary-layout/empty-actions.component').then(
        (m) => m.EmptyActionsComponent,
      ),
    outlet: 'toolbarActions',
  },
  {
    path: 'wallet-positions',
    loadComponent: () =>
      import('./ss-lpp/ss-lpp.component').then((m) => m.SsLppComponent),
    title: 'Wallet Positions',
  },
  {
    path: 'wallet-positions',
    loadComponent: () =>
      import('./ss-lpp/ss-lpp-actions.component').then(
        (m) => m.SsLppActionsComponent,
      ),
    outlet: 'toolbarActions',
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./settings/settings.component').then((m) => m.SettingsComponent),
  },
];
