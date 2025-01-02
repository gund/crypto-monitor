import { fromEvent, share } from 'rxjs';

export class MessageChannel<T = unknown> {
  readonly messages = fromEvent<MessageEvent<T>>(this.channel, 'message').pipe(
    share(),
  );

  constructor(private readonly channel: BroadcastChannel) {}

  sendMessage(data: T) {
    this.channel.postMessage(data);
  }

  close() {
    this.channel.close();
  }
}

export class TypeMessageChannel<
  T extends { type: string },
> extends MessageChannel<T> {
  handleMessages(
    handlerMap: Partial<
      Record<T['type'], (event: MessageEvent<T>) => void | Promise<void>>
    >,
  ) {
    return new MessageChannelHandler(handlerMap).handle(this);
  }
}

export class MessageChannelHandler<T extends { type: string }> {
  constructor(
    private readonly handlerMap: Partial<
      Record<T['type'], (event: MessageEvent<T>) => void | Promise<void>>
    >,
  ) {}

  handle(channel: MessageChannel<T>) {
    return channel.messages.subscribe((event) =>
      this.handlerMap[event.data.type as T['type']]?.(event),
    );
  }
}
