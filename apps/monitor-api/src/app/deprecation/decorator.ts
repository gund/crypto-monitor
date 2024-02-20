import { CustomDecorator, UseGuards, applyDecorators } from '@nestjs/common';
import { ReflectableDecorator, Reflector } from '@nestjs/core';
import { DeprecationGuard } from './guard';

export interface DeprecationMetadata {
  replacedBy?: DeprecationReplacement;
  since?: Date;
  removeBy?: Date;
}

export interface DeprecationReplacement {
  link: string;
  type?: string;
}

const DeprecationMeta = Reflector.createDecorator<DeprecationMetadata>();

export const Deprecation: ReflectableDecorator<DeprecationMetadata> = (
  options,
) => {
  const decorator = applyDecorators(
    DeprecationMeta(options),
    UseGuards(DeprecationGuard),
  ) as CustomDecorator;
  decorator.KEY = DeprecationMeta.KEY;
  return decorator;
};
Deprecation.KEY = DeprecationMeta.KEY;
