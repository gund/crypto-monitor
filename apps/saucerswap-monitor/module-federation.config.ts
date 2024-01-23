import { ModuleFederationConfig } from '@nx/webpack';

const config: ModuleFederationConfig = {
  name: 'saucerswap-monitor',
  exposes: {
    './remote-entry': 'apps/saucerswap-monitor/src/app/remote-entry/index.ts',
  },
};

export default config;
