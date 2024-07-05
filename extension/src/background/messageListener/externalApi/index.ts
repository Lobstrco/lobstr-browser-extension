import { ExternalRequestTx } from "@shared/constants/types";
import browser from "webextension-polyfill";
import { EXTERNAL_SERVICE_TYPES } from "@shared/constants/services";
import { requestAccess } from "./requestAccess";
import { signTransaction } from "./signTransaction";
import { requestConnectionStatus } from "./requestConnectionStatus";

export function externalApiMessageListener(
    request: ExternalRequestTx,
    sender: browser.Runtime.MessageSender
) {
    switch (request.type) {
        case EXTERNAL_SERVICE_TYPES.REQUEST_ACCESS:
            return requestAccess(sender);
        case EXTERNAL_SERVICE_TYPES.SIGN_TRANSACTION:
            return signTransaction(request, sender);
        case EXTERNAL_SERVICE_TYPES.REQUEST_CONNECTION_STATUS:
            return requestConnectionStatus();
        default:
            return Promise.resolve();
    }
}