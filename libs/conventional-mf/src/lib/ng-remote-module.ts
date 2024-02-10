import { Route } from '@angular/router';
import { loadRemoteModule } from '@nx/angular/mf';

export interface NgRemoteModule {
  routes: Route[];
}

export const NgRemoteModuleName = './remote';

export function exposeNgRemoteModule(path: string) {
  return { [NgRemoteModuleName]: path };
}

export function importNgRemoteModule(path: string): Promise<NgRemoteModule> {
  return loadRemoteModule(path, NgRemoteModuleName).then((m) => m.default);
}
