import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./ss-lpp/ss-lpp.component').then((m) => m.SsLppComponent),
  },
];
