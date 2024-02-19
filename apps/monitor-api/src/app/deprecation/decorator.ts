import { Reflector } from '@nestjs/core';

export interface DeprecationMetadata {
  replacedBy?: DeprecationReplacement;
  since?: Date;
  removeBy?: Date;
}

export interface DeprecationReplacement {
  link: string;
  type?: string;
}

export const Deprecation = Reflector.createDecorator<DeprecationMetadata>();
