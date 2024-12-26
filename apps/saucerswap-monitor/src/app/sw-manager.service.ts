import { Inject, Injectable, InjectionToken } from '@angular/core';
import { SWManager } from '@crypto-monitor/ngsw-notifications';

@Injectable({ providedIn: 'root' })
export class SWManagerService extends SWManager {
  // Jest is **retarded** and complains ReferenceError: ServiceWorkerContainer is not defined
  // while ServiceWorkerContainer is just a type and not a value... WTF!?
  // So here we go with the `never` type to make it happy, GG.
  constructor(@Inject(SWContainerToken) sw: never) {
    super(sw);
  }
}

export const SWContainerToken = new InjectionToken<ServiceWorkerContainer>(
  'SWContainer',
  { providedIn: 'root', factory: () => globalThis.navigator.serviceWorker },
);
