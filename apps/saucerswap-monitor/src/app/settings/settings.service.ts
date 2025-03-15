import { Injectable } from '@angular/core';
import { IDBStorageService } from '../idb-storage.service';
import {
  BehaviorSubject,
  defer,
  map,
  Observable,
  Subject,
  withLatestFrom,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private static PREFIX = 'sm-settings::';

  defaultCheckingInteval = CheckingInterval.OnceIn12Hours;
  private setCheckingInteval$ = new BehaviorSubject(
    this.defaultCheckingInteval,
  );
  checkingInteval$ = this.getSetting(
    'checkingInterval',
    this.setCheckingInteval$,
  );

  constructor(private readonly storage: IDBStorageService) {}

  async updateCheckingInterval(interval: CheckingInterval) {
    await this.setSetting(
      'checkingInterval',
      interval,
      this.setCheckingInteval$,
    );
  }

  private getSetting<T>(key: string, defaultValue$: Observable<T>) {
    return defer(() =>
      this.storage.get<T>(`${SettingsService.PREFIX}${key}`),
    ).pipe(
      withLatestFrom(defaultValue$),
      map(([value, defaultValue]) => value ?? defaultValue),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async setSetting(key: string, value: unknown, obs$: Subject<any>) {
    await this.storage.set(`${SettingsService.PREFIX}${key}`, value);
    obs$.next(value);
  }
}

export enum CheckingInterval {
  OnceIn6Hours = 21600000,
  OnceIn12Hours = 43200000,
  OnceIn24Hours = 86400000,
  OnceAWeek = 604800000,
  OnceAMonth = 2592000000,
}
