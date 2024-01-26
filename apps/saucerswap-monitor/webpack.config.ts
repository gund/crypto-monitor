import { withModuleFederation } from '@nx/angular/module-federation';
import mfConfig from './module-federation.config';
import { WebpackEnvPlugin } from './webpack-env-plugin';

export default async (config: any) =>
  (await withModuleFederation(mfConfig))({
    ...config,
    output: {
      ...config?.output,
      scriptType: 'text/javascript',
    },
    plugins: [
      ...(config?.plugins ?? []),
      new WebpackEnvPlugin({ env: process.env, prefix: 'SSM_' }),
    ],
  });
