import browser from "webextension-polyfill";
import { ROUTES } from "../../../popup/constants/routes";
import { PopupWindow } from "../../helpers/popupWindow";
import { AsyncOperation, AsyncOperationsStore } from "../../helpers/asyncOperations";
import { GrantAccessResolve, RequestAccessData } from "@shared/constants/mesagesData.types";
import { MessageError } from "@shared/helpers/errors";
import { ERROR_MESSAGES } from "@shared/constants/errorMessages";

export function requestAccess(sender: browser.Runtime.MessageSender): Promise<unknown> {
    return AsyncOperationsStore
        .create<GrantAccessResolve, null>()
        .syncEffect((operation: AsyncOperation<GrantAccessResolve>) => {
            const data: RequestAccessData = { url: sender.url || "", operationId: operation.id };
            new PopupWindow(ROUTES.grantAccess, data)
                .onRemoved(() => operation.reject(new MessageError(ERROR_MESSAGES.USER_DECLINED_ACCESS)));
        })
        .promise;
}