import { Controller } from '@nestjs/common';
import { SaucerSwapLPPController } from './lpp.controller';
import { Deprecation } from '../deprecation';

/**
 * Controller for SaucerSwap LPP V1
 * @deprecated Use {@link SaucerSwapLPPController} instead. Scheduled for removal at 20-03-2024.
 */
@Deprecation({
  replacedBy: { link: '/v2/saucer-swap/lpp', type: 'application/json' },
  since: new Date('2024-02-20T00:00:00.000Z'),
  removeBy: new Date('2024-03-20T00:00:00.000Z'),
})
@Controller({
  path: 'saucer-swap-lpp',
  version: '1',
})
export class SaucerSwapLPPV1Controller extends SaucerSwapLPPController {}
