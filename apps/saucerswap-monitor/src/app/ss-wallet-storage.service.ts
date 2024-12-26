import { Injectable } from '@angular/core';
import { SSWalletStorage } from './ss-wallet-storage';
import { IDBStorageService } from './idb-storage.service';
import { LocalStorageService } from './local-storage.service';
import { OnAppInit } from './app-init.service';

@Injectable({ providedIn: 'root' })
export class SSWalletStorageService
  extends SSWalletStorage
  implements OnAppInit
{
  constructor(
    storage: IDBStorageService<string[]>,
    private readonly localStorage: LocalStorageService,
  ) {
    super(storage);
  }

  async onAppInit() {
    await this.migrateFromLocalstorage();
  }

  private async migrateFromLocalstorage() {
    const existingWalltets = await this.localStorage.get<string[]>(
      SSWalletStorage.WALLET_IDS_KEY,
    );

    if (!existingWalltets?.length) {
      return;
    }

    await this.storage.update(
      SSWalletStorage.WALLET_IDS_KEY,
      (currentWallets) => [...(currentWallets ?? []), ...existingWalltets],
    );

    await this.localStorage.delete(SSWalletStorage.WALLET_IDS_KEY);
  }
}
