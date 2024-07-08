import browser from "webextension-polyfill";
import {
  EXTERNAL_SERVICE_TYPES,
  SERVICE_TYPES,
} from "@shared/constants/services";

import { ROUTES } from "popup/constants/routes";
import { PopupWindow } from "./helpers/popupWindow";
import { externalApiMessageListener } from "./messageListener/external";
import { MessageError } from "./helpers/messageError";
import { internalMessagesListener } from "./messageListener/internal";

export const initContentScriptMessageListener = () => {
  browser?.runtime?.onMessage?.addListener((message) => {
    if (message === "runContentScript") {
      browser.tabs.executeScript({
        file: "contentScript.min.js",
      });
    }
  });
};

export const initExtensionMessageListener = () => {
  browser?.runtime?.onMessage?.addListener((request, sender) => {
    if (request.type in SERVICE_TYPES) {
      return internalMessagesListener(request);
    } else if (request.type in EXTERNAL_SERVICE_TYPES) {
      return externalApiMessageListener(request, sender)
          .catch((error: unknown) =>
            error instanceof MessageError ?
              Promise.resolve(error) :
              Promise.reject(error));
    } else {
      return Promise.resolve();
    }
  });
};

export const initInstalledListener = () => {
  browser?.runtime?.onInstalled.addListener(async ({ reason, temporary }) => {
    if (temporary) return; // skip during development
    switch (reason) {
      case "install":
        await new PopupWindow(ROUTES.welcome).window;
        break;
      // TODO: case "update":
      // TODO: case "browser_update":
      default:
    }
  });
};
