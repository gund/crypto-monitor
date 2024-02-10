import { ModuleFederationConfig } from '@nx/webpack';

const config: ModuleFederationConfig = {
  name: 'saucerswap-monitor',
  exposes: {
    './remote': 'apps/saucerswap-monitor/src/app/remote.ts',
  },
};

export default config;
