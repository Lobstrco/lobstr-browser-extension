import browser from "webextension-polyfill";
import { ExternalRequestTx } from "@shared/constants/types";
import { getUrlHostname } from "../../../helpers/urls";

import { ROUTES } from "../../../popup/constants/routes";
import { AllowedSenders } from "../../helpers/allowListAuthorization";
import { PopupWindow } from "background/helpers/popupWindow";
import { AsyncOperationsStore } from "../../helpers/asyncOperations";
import { MessageError } from "../../helpers/messageError";
import { RequestSignAdditional, SignRequestResolve } from "@shared/constants/mesagesData.types";

export function signTransaction(
    request: ExternalRequestTx,
    { url = "" }: browser.Runtime.MessageSender
): Promise<unknown> {
    return AsyncOperationsStore
        .create<SignRequestResolve, RequestSignAdditional>()
        .syncEffect((operation) => {
            const { transactionXdr, connectionKey } = request;
            if (!connectionKey) {
                return operation.reject(new MessageError("The connection key is missing"));
            }
            const domain = getUrlHostname(url);
            operation.setAdditionalData({ transactionXdr, connectionKey, domain });
            new PopupWindow(ROUTES.sendTransaction, { connectionKey, operationId: operation.id })
                .onUnableToOpen(() => operation.reject(new MessageError("Couldn't open access prompt")))
                .onRemoved(() => operation.reject(new MessageError("User declined access")));
        })
        .onResolve(() => AllowedSenders.addToList(url))
        .promise;
}