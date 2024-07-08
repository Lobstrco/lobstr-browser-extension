import browser from "webextension-polyfill";
import { ROUTES } from "../../../popup/constants/routes";
import { PopupWindow } from "../../helpers/popupWindow";
import { AsyncOperation, AsyncOperationsStore } from "../../helpers/asyncOperations";
import { GrantAccessResolve, RequestAccessData } from "@shared/constants/mesagesData.types";
import { MessageError } from "../../helpers/messageError";

export function requestAccess(sender: browser.Runtime.MessageSender): Promise<unknown> {
    // Create awaiting operation in store
    return AsyncOperationsStore
        .create<GrantAccessResolve, null>()
        .syncEffect((operation: AsyncOperation<GrantAccessResolve>) => {
            // open grantAccess popup
            const data: RequestAccessData = { url: sender.url || "", operationId: operation.id };
            new PopupWindow(ROUTES.grantAccess, data)
                .onRemoved(() => operation.reject(new MessageError("User declined access" )));
        })
        .promise;
}