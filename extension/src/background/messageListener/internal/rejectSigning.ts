import { AsyncOperationsStore } from "../../helpers/asyncOperations";
import { RequestWithOperation } from "@shared/constants/mesagesData.types";
import { MessageError } from "@shared/helpers/errors";
import {
    ERROR_MESSAGES,
    missingOperationMessage,
} from "@shared/constants/errorMessages";

export function rejectSigning(data: RequestWithOperation) {
    const { operationId } = data;
    const operation = AsyncOperationsStore.get(operationId);
    if (!operation) {
        console.error(missingOperationMessage("rejectSigning", operationId));
        return;
    }
    operation.reject(new MessageError(ERROR_MESSAGES.ACCOUNT_NOT_FOUND));
}
