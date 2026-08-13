import browser from "webextension-polyfill";
import { ExternalRequestTxV2 } from "@shared/constants/types";
import { getUrlHostname } from "../../../helpers/urls";

import { AllowedSenders } from "../../helpers/allowListAuthorization";
import {
    AsyncOperation,
    AsyncOperationsStore,
} from "../../helpers/asyncOperations";
import { queueSignRequest } from "../../helpers/signPrompt";
import { MessageError } from "@shared/helpers/errors";
import { ERROR_MESSAGES } from "@shared/constants/errorMessages";
import {
    RequestSignAdditional,
    SignRequestResolve,
} from "@shared/constants/mesagesData.types";

type SignOperation = AsyncOperation<SignRequestResolve, RequestSignAdditional>;

export function sign(
    request: ExternalRequestTxV2,
    { url = "" }: browser.Runtime.MessageSender,
): Promise<SignRequestResolve> {
    return AsyncOperationsStore.create<
        SignRequestResolve,
        RequestSignAdditional
    >()
        // queued without awaiting, so back-to-back requests keep their order
        .syncEffect((operation: SignOperation) => {
            const { dataToSign, connectionKey, signType } = request;
            if (!connectionKey) {
                return operation.reject(
                    new MessageError(ERROR_MESSAGES.CONNECTION_KEY_MISSING),
                );
            }
            if (!dataToSign) {
                return operation.reject(
                    new MessageError(ERROR_MESSAGES.DATA_TO_SIGN_MISSING),
                );
            }
            operation.setAdditionalData({
                dataToSign,
                connectionKey,
                domain: getUrlHostname(url),
                signType,
            });
            queueSignRequest(operation);
        })
        .onResolve(() => AllowedSenders.addToList(url)).promise;
}
