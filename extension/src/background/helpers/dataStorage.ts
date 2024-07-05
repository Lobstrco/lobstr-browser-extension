import browser from "webextension-polyfill";
import { Storage } from "webextension-polyfill/namespaces/storage";

export class BrowserStorage {
  constructor(private readonly storage: Storage.StorageArea | Storage.LocalStorageArea) {}

  async getItem(key: string): Promise<any> {
    const storageResult = await this.storage.get(key);
    const value: unknown = storageResult[key];
    if (typeof value !== 'string') {
      return value;
    }
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }

  async setItem(keyId: string, value: any): Promise<void> {
    await this.storage.set({ [keyId]: JSON.stringify(value) });
  }

  async clear(): Promise<void> {
    await this.storage.clear();
  }
}

export const LocalStorage: BrowserStorage = new BrowserStorage(browser.storage.local);
// export const SessionStorage: BrowserStorage = new BrowserStorage(browser.storage.session);

