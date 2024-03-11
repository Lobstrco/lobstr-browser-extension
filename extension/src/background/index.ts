import browser from "webextension-polyfill";
import { Store } from "redux";
import {
  EXTERNAL_SERVICE_TYPES,
  SERVICE_TYPES,
} from "@shared/constants/services";

import { popupMessageListener } from "./messageListener/popupMessageListener";
import {
  getWindowSettings,
  signerExtensionApiMessageListener,
} from "./messageListener/signerExtensionApiMessageListener";
import { ROUTES } from "popup/constants/routes";

export const initContentScriptMessageListener = () => {
  browser?.runtime?.onMessage?.addListener((message) => {
    if (message === "runContentScript") {
      browser.tabs.executeScript({
        file: "contentScript.min.js",
      });
    }
  });
};

export const initExtensionMessageListener = (sessionStore: Store) => {
  browser?.runtime?.onMessage?.addListener(async (request, sender) => {
    // todo this is kinda ugly
    let res;
    if (Object.values(SERVICE_TYPES).includes(request.type)) {
      res = await popupMessageListener(request, sessionStore);
    }
    if (Object.values(EXTERNAL_SERVICE_TYPES).includes(request.type)) {
      res = await signerExtensionApiMessageListener(request, sender);
    }

    return res;
  });
};

export const initInstalledListener = () => {
  browser?.runtime?.onInstalled.addListener(async ({ reason, temporary }) => {
    if (temporary) return; // skip during development
    switch (reason) {
      case "install":
        const settings = await getWindowSettings();
        await browser.windows.create({
          url: chrome.runtime.getURL(`index.html#${ROUTES.welcome}`),
          ...settings,
        });
        break;
      // TODO: case "update":
      // TODO: case "browser_update":
      default:
    }
  });
};
