import { DefinePlugin } from 'webpack';

export interface WebpackEnvPluginConfig {
  env: Record<string, string | undefined>;
  prefix?: string;
}

export class WebpackEnvPlugin extends DefinePlugin {
  constructor(config: WebpackEnvPluginConfig) {
    const env = Object.fromEntries(
      Object.entries(config.env).filter(
        ([key]) => !config.prefix || key.startsWith(config.prefix),
      ),
    );

    super({ 'process.env': JSON.stringify(env) });
  }
}
