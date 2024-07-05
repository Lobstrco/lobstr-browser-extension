import browser from "webextension-polyfill";

import { LocalStorage } from "./dataStorage";
import { ALLOWLIST_ID } from "constants/localStorageTypes";
import { getUrlHostname, getPunycodedDomain } from "helpers/urls";

export const isSenderAllowed = async ({
  sender,
}: {
  sender: browser.Runtime.MessageSender;
}) => {
  const allowListStr = (await LocalStorage.getItem(ALLOWLIST_ID)) || "";
  const allowList = allowListStr.split(",");

  const { url: tabUrl = "" } = sender;
  const domain = getUrlHostname(tabUrl);

  return allowList.includes(getPunycodedDomain(domain));
};
