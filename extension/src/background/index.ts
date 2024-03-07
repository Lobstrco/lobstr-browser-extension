import browser from "webextension-polyfill";
import { Store } from "redux";
import {
  EXTERNAL_SERVICE_TYPES,
  SERVICE_TYPES,
} from "@shared/constants/services";

import { popupMessageListener } from "./messageListener/popupMessageListener";
import { signerExtensionApiMessageListener } from "./messageListener/signerExtensionApiMessageListener";
import {
  POPUP_HEIGHT,
  POPUP_OFFSET_TOP,
  POPUP_OFFSET_RIGHT,
  POPUP_WIDTH,
} from "./constants/dimensions";
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
        const currentWindow = await browser.windows.getCurrent();
        console.log(currentWindow);
        await browser.windows.create({
          url: chrome.runtime.getURL(`index.html#${ROUTES.welcome}`),
          type: "popup",
          width: POPUP_WIDTH,
          height: POPUP_HEIGHT + 32,
          top: (currentWindow?.top || 0) + POPUP_OFFSET_TOP,
          left:
            (currentWindow?.width || 0) +
            (currentWindow?.left || 0) -
            POPUP_WIDTH -
            POPUP_OFFSET_RIGHT,
        });
        break;
      // TODO: case "update":
      // TODO: case "browser_update":
      default:
    }
  });
};
