import { KeyValueStorage } from '@crypto-monitor/storage';

export class SSWalletStorage {
  static readonly WALLET_IDS_KEY = 'ss:wallet-ids';

  constructor(protected storage: KeyValueStorage<string[]>) {}

  async addWallet(walletId: string) {
    await this.storage.update(SSWalletStorage.WALLET_IDS_KEY, (ids) => [
      ...(ids ?? []),
      walletId,
    ]);
  }

  async removeWallet(walletId: string) {
    await this.storage.update(
      SSWalletStorage.WALLET_IDS_KEY,
      (ids) => ids?.filter((id) => id !== walletId) ?? [],
    );
  }

  async getAllWallets() {
    return (await this.storage.get(SSWalletStorage.WALLET_IDS_KEY)) ?? [];
  }
}
