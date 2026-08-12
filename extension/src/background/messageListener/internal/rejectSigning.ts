import { AsyncOperationsStore } from "../../helpers/asyncOperations";
import {
    RequestSignAdditional,
    RequestWithConnection,
    SignRequestResolve,
} from "@shared/constants/mesagesData.types";
import { MessageError } from "@shared/helpers/errors";
import {
    ERROR_MESSAGES,
    mismatchedConnectionMessage,
    missingOperationMessage,
} from "@shared/constants/errorMessages";

export function rejectSigning(data: RequestWithConnection) {
    const { operationId } = data;
    const operation = AsyncOperationsStore.get<
        SignRequestResolve,
        RequestSignAdditional
    >(operationId);
    if (!operation) {
        console.error(missingOperationMessage("rejectSigning", operationId));
        return;
    }
    const additionalData = operation.getAdditionalData();
    // a popup outliving a worker restart must not reject somebody else's operation
    if (!additionalData || additionalData.connectionKey !== data.connectionKey) {
        console.error(mismatchedConnectionMessage("rejectSigning", operationId));
        return;
    }
    operation.reject(new MessageError(ERROR_MESSAGES.ACCOUNT_NOT_FOUND));
}
