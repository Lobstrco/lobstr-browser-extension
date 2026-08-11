import { AsyncOperationsStore } from "../../helpers/asyncOperations";
import { MessageError } from "@shared/helpers/errors";
import {
    ERROR_MESSAGES,
    missingOperationMessage,
} from "@shared/constants/errorMessages";
import { RequestWithOperation } from "@shared/constants/mesagesData.types";

export function rejectAccess(data: RequestWithOperation) {
    const { operationId } = data;
    const operation = AsyncOperationsStore.get(operationId);
    if (!operation) {
        console.error(missingOperationMessage("rejectAccess", operationId));
        return;
    }
    operation.reject(new MessageError(ERROR_MESSAGES.USER_DECLINED_ACCESS));
}
