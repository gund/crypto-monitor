import { setRemoteDefinitions } from '@nx/angular/mf';

Promise.all([
  fetch('/assets/module-federation.manifest.json').then((res) => res.json()),
  import('./bootstrap'),
])
  .then(([remotes, bootstrap]) => {
    setRemoteDefinitions(remotes);
    return bootstrap.boot({ routes: { remotes } });
  })
  .catch((err) => console.error(err));
