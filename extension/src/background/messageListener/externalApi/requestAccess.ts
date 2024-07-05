import browser from "webextension-polyfill";
import { ROUTES } from "../../../popup/constants/routes";
import { responseQueue } from "../popupMessageListener";
import { PopupWindow } from "../../helpers/popupWindow";

export function requestAccess(sender: browser.Runtime.MessageSender): Promise<unknown> {
    const { tab, url: tabUrl = "" } = sender;

    new PopupWindow(ROUTES.grantAccess, { tab, url: tabUrl });

    return new Promise((resolve) => {
        const response = ({ url, publicKey, connectionKey }: {
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
}