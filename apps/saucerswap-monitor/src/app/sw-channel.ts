import { TypeMessageChannel } from './message-channel';

export class SWMessageChannel extends TypeMessageChannel<SWChannelMessage> {
  constructor() {
    super(new BroadcastChannel('ss:sw:channel'));
  }
}

export type SWChannelMessage =
  | SWNewClientMessage
  | SWPositionsCheckStartedMessage
  | SWPositionsCheckCompletedMessage;

export interface SWNewClientMessage {
  type: 'new-client';
}

export interface SWPositionsCheckStartedMessage {
  type: 'positions-check-started';
}

export interface SWPositionsCheckCompletedMessage {
  type: 'positions-check-completed';
  error?: string;
}
