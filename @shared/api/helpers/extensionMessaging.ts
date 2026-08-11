import browser from "webextension-polyfill";
import { Response } from "@shared/constants/types";
import {
  DEV_SERVER,
  EXTERNAL_MSG_RESPONSE,
  EXTERNAL_MSG_REQUEST,
  EXTERNAL_SERVICE_TYPES,
  SERVICE_TYPES,
} from "../../constants/services";

interface Msg {
  [key: string]: any;
  type: EXTERNAL_SERVICE_TYPES | SERVICE_TYPES;
}

export const sendMessageToContentScript = (msg: Msg): Promise<any> => {
  // correlates the reply; without it concurrent calls all resolve with the first one back
  const MESSAGE_ID = Date.now() + Math.random();

  window.postMessage(
    { source: EXTERNAL_MSG_REQUEST, messageId: MESSAGE_ID, ...msg },
    window.location.origin,
  );
  return new Promise((resolve) => {
    let requestTimeout: number | NodeJS.Timeout = 0;

    // nothing answers when LOBSTR is absent, and this is what pages call to find out
    if (msg.type === EXTERNAL_SERVICE_TYPES.REQUEST_CONNECTION_STATUS) {
      requestTimeout = setTimeout(() => {
        resolve({ isConnected: false });
        window.removeEventListener("message", messageListener);
      }, 2000);
    }

    const messageListener = (event: { source: any; data: any }) => {
      if (event.source !== window) return;
      if (event?.data?.source !== EXTERNAL_MSG_RESPONSE) return;
      // post `messageId`, read `messagedId` — never rename one side, they ship separately
      if (event?.data?.messagedId !== MESSAGE_ID) return;

      resolve(event.data);
      window.removeEventListener("message", messageListener);
      clearTimeout(requestTimeout);
    };
    window.addEventListener("message", messageListener, false);
  });
};

export const sendMessageToBackground = async (msg: Msg): Promise<Response> => {
  let res;
  if (DEV_SERVER) {
    // treat this as an external call because we're making the call from the browser, not the popup
    res = await sendMessageToContentScript(msg);
  } else {
    res = await browser.runtime.sendMessage(msg);
  }

  return res;
};
