import browser from "webextension-polyfill";

import { LocalStorage } from "./dataStorage";
import { ALLOWLIST_ID } from "constants/localStorageTypes";
import { getUrlHostname, getPunycodedDomain } from "helpers/urls";

/**
 * Singleton that provides 2 public methods:
 *
 * - isAllowed(sender: browser.Runtime.MessageSender) - check if sender already saved in AllowedList
 * - addToList(sender: string) - saves provided domain to list
 * */
class AllowedSendersSingleton {
  private $AllowedSenders: Promise<string[]> = this.initialize();

  async isAllowed(sender: browser.Runtime.MessageSender): Promise<boolean> {
    const { url: tabUrl = "" } = sender;
    const domain: string = this.getSanitizedDomain(tabUrl);
    const allowedSenders = await this.$AllowedSenders;
    return allowedSenders.includes(domain);
  }

  async addToList(sender: string): Promise<void> {
    if (!sender) {
      return;
    }
    const domain: string = this.getSanitizedDomain(sender);
    const allowedSenders = await this.$AllowedSenders;
    if (allowedSenders.includes(domain)) {
      return;
    }
    await this.saveAllowedSenders([...allowedSenders, domain]);
  }

  /**
   * @returns Promise<string[]> - allowed senders domains
   * Get domains list from LocalStorage.
   * Check for old format and parse to array if needed (and save)
   * */
  private async initialize(): Promise<string[]> {
    const allowedSenders: string | string[] | undefined = await LocalStorage.getItem(ALLOWLIST_ID);
    if (!allowedSenders) {
      return [];
    }
    // update old format
    if (typeof allowedSenders === 'string') {
      const parsedSenders: string[] = allowedSenders.split(',');
      await LocalStorage.setItem(ALLOWLIST_ID, parsedSenders);
      return parsedSenders;
    }
    return allowedSenders;
  }

  private getSanitizedDomain(url: string): string {
    const domain: string = getUrlHostname(url);
    return getPunycodedDomain(domain);
  }

  private async saveAllowedSenders(senders: string[]): Promise<void> {
    const uniqueSender: string[] = Array.from(new Set(senders));
    await LocalStorage.setItem(ALLOWLIST_ID, uniqueSender);
    this.$AllowedSenders = Promise.resolve(uniqueSender);
  }
}

export const AllowedSenders = new AllowedSendersSingleton();
