import browser from "webextension-polyfill";
import { ExternalRequestTx } from "@shared/constants/types";
import { getUrlHostname } from "../../../helpers/urls";
import { responseQueue, transactionQueue } from "../popupMessageListener";

import { ROUTES } from "../../../popup/constants/routes";
import { AllowedSenders } from "../../helpers/allowListAuthorization";
import { PopupWindow } from "background/helpers/popupWindow";

export function signTransaction(
    request: ExternalRequestTx,
    sender: browser.Runtime.MessageSender
): Promise<unknown> {
    const { transactionXdr, connectionKey } = request;

    const { url: tabUrl = "" } = sender;
    const domain = getUrlHostname(tabUrl);


    if (!connectionKey) {
        return Promise.resolve({ error: "The connection key is missing" });
    }

    transactionQueue.push({ transactionXdr, connectionKey, domain });

    return new Promise((resolve) => {
        new PopupWindow(ROUTES.sendTransaction, { connectionKey })
            .onUnableToOpen(() => resolve({ error: "Couldn't open access prompt" }))
            .onRemoved(() => resolve({ error: "User declined access" }));

        const response = (signedTransaction: string | { error: string }) => {
            if (!signedTransaction) {
                resolve({ error: "User declined access" });
                return;
            }

            AllowedSenders.addToList(tabUrl);

            const error: string | null = (signedTransaction as { error: string }).error || null;
            return error ? resolve({ error }) : resolve({ signedTransaction });
        };

        responseQueue.push(response);
    });
}