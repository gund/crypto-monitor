export interface NGSWPushEventInit extends PushEventInit {
  originalEvent: ExtendableEvent;
}

export class NGSWPushEvent extends PushEvent {
  static with(
    originalEvent: ExtendableEvent,
    data: PushMessageDataInit,
  ): NGSWPushEvent {
    return new NGSWPushEvent('push', {
      originalEvent,
      data,
    });
  }

  protected readonly originalEvent: ExtendableEvent;

  constructor(type: string, eventInitDict: NGSWPushEventInit) {
    super(type, eventInitDict);
    this.originalEvent = eventInitDict.originalEvent;
  }

  override waitUntil(promise: Promise<unknown>) {
    this.originalEvent.waitUntil(promise);
  }
}
