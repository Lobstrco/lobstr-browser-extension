import browser from "webextension-polyfill";
import { ExternalRequestTxV2 } from "@shared/constants/types";
import { getUrlHostname } from "../../../helpers/urls";

import { ROUTES } from "../../../popup/constants/routes";
import { AllowedSenders } from "../../helpers/allowListAuthorization";
import { PopupWindow } from "background/helpers/popupWindow";
import { AsyncOperationsStore } from "../../helpers/asyncOperations";
import { MessageError } from "../../helpers/messageError";
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
                return operation.reject(new MessageError("The connection key is missing"));
            }
            const domain = getUrlHostname(url);
            operation.setAdditionalData({ dataToSign, connectionKey, domain, signType });
            new PopupWindow(ROUTES.signModal, { connectionKey, operationId: operation.id, signType })
                .onUnableToOpen(() => operation.reject(new MessageError("Couldn't open access prompt")))
                .onRemoved(() => operation.reject(new MessageError("User declined access")));
        })
        .onResolve(() => AllowedSenders.addToList(url))
        .promise;
}