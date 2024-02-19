import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends AppConfigEnv {}
  }
}

export interface AppConfigEnv {
  PUBLIC_URL: string;
}

@Injectable()
export class AppConfigService {
  readonly publicUrl = this.configService.getOrThrow('PUBLIC_URL');

  constructor(private readonly configService: ConfigService<AppConfigEnv>) {}
}
