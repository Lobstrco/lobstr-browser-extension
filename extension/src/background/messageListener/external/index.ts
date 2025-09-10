import {
    ExternalRequestTxV1,
    ExternalRequestTxV2,
} from "@shared/constants/types";
import browser from "webextension-polyfill";
import { EXTERNAL_SERVICE_TYPES } from "@shared/constants/services";
import { API_VERSION } from "@shared/constants/api-version";
import { requestAccess } from "./requestAccess";
import { sign } from "./sign";
import { requestConnectionStatus } from "./requestConnectionStatus";

export function externalApiMessageListener(
    request: ExternalRequestTxV1 | ExternalRequestTxV2,
    sender: browser.Runtime.MessageSender,
) {
    const apiVersion: API_VERSION =
        (request as ExternalRequestTxV2).version || API_VERSION.V1;
    switch (request.type) {
        case EXTERNAL_SERVICE_TYPES.REQUEST_ACCESS:
            return requestAccess(sender);

        // ------ old api requests ------
        case EXTERNAL_SERVICE_TYPES.SIGN_TRANSACTION:
        case EXTERNAL_SERVICE_TYPES.SUBMIT_TRANSACTION:
            const requestData = getSignDataFromOldRequest(request, apiVersion);
            return sign(requestData, sender).then(
                ({ signedData: signedTransaction }) => ({
                    signedTransaction, // transform return data for backward compatibility
                }),
            );
        // ------ end old api requests ------
        case EXTERNAL_SERVICE_TYPES.SIGN:
            return sign(request as ExternalRequestTxV2, sender);
        case EXTERNAL_SERVICE_TYPES.REQUEST_CONNECTION_STATUS:
            return requestConnectionStatus();
        default:
            return Promise.resolve();
    }
}

function getSignDataFromOldRequest(
    request: ExternalRequestTxV1 | ExternalRequestTxV2,
    apiVersion: API_VERSION,
): ExternalRequestTxV2 {
    if (apiVersion === API_VERSION.V2) {
        return request as ExternalRequestTxV2;
    }
    const data = request as ExternalRequestTxV1;
    return {
        ...data,
        dataToSign: data.transactionXdr,
        signType: "transaction",
        version: API_VERSION.V2,
    };
}
