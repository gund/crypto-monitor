import { withModuleFederation } from '@nx/angular/module-federation';
import mfConfig from './module-federation.config';

export default async (config: any) =>
  (await withModuleFederation(mfConfig))({
    ...config,
    output: {
      ...config?.output,
      scriptType: 'text/javascript',
    },
  });
