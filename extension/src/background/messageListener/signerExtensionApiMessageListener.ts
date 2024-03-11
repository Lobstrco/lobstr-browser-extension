import browser from "webextension-polyfill";

import { ExternalRequestTx } from "@shared/constants/types";
import { EXTERNAL_SERVICE_TYPES } from "@shared/constants/services";
import { isSenderAllowed } from "../helpers/allowListAuthorization";
import {
  encodeObject,
  getPunycodedDomain,
  getUrlHostname,
} from "../../helpers/urls";
import { ROUTES } from "../../popup/constants/routes";
import { browserLocalStorage, dataStorageAccess } from "../helpers/dataStorage";
import { ALLOWLIST_ID } from "../../constants/localStorageTypes";
import { responseQueue, transactionQueue } from "./popupMessageListener";
import { MessageResponder } from "background/types";

import {
  POPUP_HEIGHT,
  POPUP_OFFSET_TOP,
  POPUP_OFFSET_RIGHT,
  POPUP_WIDTH,
} from "background/constants/dimensions";

const localStore = dataStorageAccess(browserLocalStorage);

interface WINDOW_PARAMS {
  type: "popup";
  width: number;
  height: number;
  top: number;
  left: number;
}

export const getWindowSettings = async (): Promise<WINDOW_PARAMS> => {
  const currentWindow = await browser.windows.getCurrent();
  const platform = await chrome.runtime.getPlatformInfo();
  const frameSize = platform.os === "win" ? 40 : 32;

  return {
    type: "popup",
    width: POPUP_WIDTH,
    height: POPUP_HEIGHT + frameSize,
    top: (currentWindow?.top || 0) + POPUP_OFFSET_TOP,
    left:
      (currentWindow?.width || 0) +
      (currentWindow?.left || 0) -
      POPUP_WIDTH -
      POPUP_OFFSET_RIGHT,
  };
};

export const signerExtensionApiMessageListener = (
  request: ExternalRequestTx,
  sender: browser.Runtime.MessageSender,
) => {
  const requestAccess = async () => {
    const { tab, url: tabUrl = "" } = sender;
    const encodeOrigin = encodeObject({ tab, url: tabUrl });

    const settings = await getWindowSettings();

    browser.windows.create({
      url: chrome.runtime.getURL(
        `/index.html#${ROUTES.grantAccess}?${encodeOrigin}`,
      ),
      ...settings,
    });

    return new Promise((resolve) => {
      const response = ({
        url,
        publicKey,
        connectionKey,
      }: {
        url?: string;
        publicKey?: string;
        connectionKey?: string;
      }) => {
        // queue it up, we'll let user confirm the url looks okay and then we'll send publicKey
        // if we're good, of course
        if (url === tabUrl) {
          resolve({ publicKey, connectionKey });
        }

        resolve({ error: "User declined access" });
      };

      responseQueue.push(response);
    });
  };

  const signTransaction = async () => {
    const { transactionXdr, connectionKey } = request;

    const { url: tabUrl = "" } = sender;
    const domain = getUrlHostname(tabUrl);
    const punycodedDomain = getPunycodedDomain(domain);

    const allowListStr = (await localStore.getItem(ALLOWLIST_ID)) || "";
    const allowList = allowListStr.split(",");
    const isDomainListedAllowed = await isSenderAllowed({ sender });

    if (!connectionKey) {
      return Promise.resolve({ error: "The connection key is missing" });
    }

    const info = {
      connectionKey,
    };

    transactionQueue.push({ transactionXdr, connectionKey, domain });
    const encodedBlob = encodeObject(info);

    const settings = await getWindowSettings();
    const popup = await browser.windows.create({
      url: chrome.runtime.getURL(
        `/index.html#${ROUTES.sendTransaction}?${encodedBlob}`,
      ),
      ...settings,
    });

    return new Promise((resolve) => {
      if (!popup) {
        resolve({ error: "Couldn't open access prompt" });
      } else {
        browser.windows.onRemoved.addListener((removed) => {
          if (popup.id === removed) {
            resolve({
              error: "User declined access",
            });
          }
        });
      }
      const response = (signedTransaction: string | { error: string }) => {
        if (signedTransaction) {
          if (!isDomainListedAllowed) {
            allowList.push(punycodedDomain);
            localStore.setItem(ALLOWLIST_ID, allowList.join());
          }
          if ((signedTransaction as { error: string }).error) {
            return resolve({
              error: (signedTransaction as { error: string }).error,
            });
          }
          return resolve({ signedTransaction });
        }

        resolve({ error: "User declined access" });
      };

      responseQueue.push(response);
    });
  };

  const requestConnectionStatus = () => ({ isConnected: true });

  const messageResponder: MessageResponder = {
    [EXTERNAL_SERVICE_TYPES.REQUEST_ACCESS]: requestAccess,
    [EXTERNAL_SERVICE_TYPES.SIGN_TRANSACTION]: signTransaction,
    [EXTERNAL_SERVICE_TYPES.REQUEST_CONNECTION_STATUS]: requestConnectionStatus,
  };

  return messageResponder[request.type]();
};
