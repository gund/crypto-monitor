export interface NGSWNotificationInfo<TAction extends string = never>
  extends Omit<NotificationOptions, 'actions'> {
  title: string;
  actions?:
    | readonly NGSWNotificationAction<TAction>[]
    | NGSWNotificationAction<TAction>[];
  data?: NGSWNotificationData<TAction>;
  image?: string;
  renotify?: boolean;
  vibrate?: number[];
}

export interface NGSWNotificationAction<TAction extends string = never> {
  action: TAction;
  title: string;
}

export interface NGSWNotificationData<TAction extends string = never> {
  onActionClick?: NGSWNotificationActions<TAction>;
}

export type NGSWNotificationActions<TAction extends string = never> = {
  default?: NGSWNotificationActionOperation;
} & Record<TAction, NGSWNotificationActionOperation>;

export interface NGSWNotificationActionOperation {
  operation: NGSWNotificationActionOperationType;
  url?: string;
}

export enum NGSWNotificationActionOperationType {
  OpenWindow = 'openWindow',
  FocusLastFocusedOrOpen = 'focusLastFocusedOrOpen',
  NavigateLastFocusedOrOpen = 'navigateLastFocusedOrOpen',
  SendRequest = 'sendRequest',
}
