import browser from "webextension-polyfill";
import {
  DEV_EXTENSION,
  EXTERNAL_MSG_REQUEST,
  EXTERNAL_MSG_RESPONSE,
  EXTERNAL_SERVICE_TYPES,
} from "@shared/constants/services";
import { ERROR_MESSAGES } from "@shared/constants/errorMessages";

export const redirectMessagesToBackground = () => {
  window.addEventListener(
    "message",
    async (event) => {
      // `messageId` in, `messagedId` out — never rename one side, the npm SDK ships separately
      const messagedId = event?.data?.messageId || 0;
      if (event.source !== window) return;

      // only allow external LOBSTR API calls unless we're in Dev Mode
      if (
        !Object.keys(EXTERNAL_SERVICE_TYPES).includes(event.data.type) &&
        !DEV_EXTENSION
      ) {
        return;
      }
      if (!event.data.source || event.data.source !== EXTERNAL_MSG_REQUEST)
        return;
      let res = { error: ERROR_MESSAGES.MESSAGING_UNAVAILABLE };
      try {
        // without `??` an undefined reply wipes the fallback and reads downstream as success
        res = (await browser.runtime.sendMessage(event.data)) ?? res;
      } catch (e) {
        console.error(e);
      }
      // `res` spreads first so it cannot overwrite the routing fields the page matches on
      window.postMessage(
        { ...res, source: EXTERNAL_MSG_RESPONSE, messagedId },
        window.location.origin,
      );
    },
    false,
  );
};
