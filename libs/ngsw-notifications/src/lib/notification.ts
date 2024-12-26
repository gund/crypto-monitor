import {
  NGSWNotificationAction,
  NGSWNotificationData,
  NGSWNotificationInfo,
} from './types';

export abstract class NGSWNotification<T, TAction extends string = never>
  implements NGSWNotificationInfo<TAction>
{
  abstract readonly tag: string;
  readonly title = this.getTitle();
  readonly body = this.getBody?.();
  readonly actions = this.getActions?.();
  readonly data = this.getData?.();

  constructor(protected readonly meta: T) {}

  protected abstract getTitle(): string;
  protected getBody?(): string | undefined;
  protected getActions?():
    | readonly NGSWNotificationAction<TAction>[]
    | undefined;
  protected getData?(): NGSWNotificationData<TAction> | undefined;

  toJSON() {
    return {
      tag: this.tag,
      title: this.title,
      body: this.body,
      actions: this.actions,
      data: this.data,
    };
  }
}
