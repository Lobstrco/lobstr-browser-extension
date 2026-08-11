import browser from "webextension-polyfill";
import { ExternalRequestTxV2 } from "@shared/constants/types";
import { getUrlHostname } from "../../../helpers/urls";

import { ROUTES } from "../../../popup/constants/routes";
import { AllowedSenders } from "../../helpers/allowListAuthorization";
import { PopupWindow } from "background/helpers/popupWindow";
import { AsyncOperationsStore } from "../../helpers/asyncOperations";
import { MessageError } from "@shared/helpers/errors";
import { ERROR_MESSAGES } from "@shared/constants/errorMessages";
import { RequestSignAdditional, SignRequestResolve } from "@shared/constants/mesagesData.types";

export function sign(
    request: ExternalRequestTxV2,
    { url = "" }: browser.Runtime.MessageSender
): Promise<SignRequestResolve> {
    return AsyncOperationsStore
        .create<SignRequestResolve, RequestSignAdditional>()
        .syncEffect((operation) => {
            const { dataToSign, connectionKey, signType } = request;
            if (!connectionKey) {
                return operation.reject(new MessageError(ERROR_MESSAGES.CONNECTION_KEY_MISSING));
            }
            const domain = getUrlHostname(url);
            operation.setAdditionalData({ dataToSign, connectionKey, domain, signType });
            new PopupWindow(ROUTES.signModal, { connectionKey, operationId: operation.id, signType })
                .onUnableToOpen(() => operation.reject(new MessageError(ERROR_MESSAGES.POPUP_OPEN_FAILED)))
                .onRemoved(() => operation.reject(new MessageError(ERROR_MESSAGES.USER_DECLINED_ACCESS)));
        })
        .onResolve(() => AllowedSenders.addToList(url))
        .promise;
}