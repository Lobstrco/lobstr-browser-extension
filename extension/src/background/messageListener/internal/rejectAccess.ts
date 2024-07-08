import { AsyncOperationsStore } from "../../helpers/asyncOperations";
import { MessageError } from "../../helpers/messageError";
import { RequestWithOperation } from "@shared/constants/mesagesData.types";

export function rejectAccess(data: RequestWithOperation) {
    const { operationId } = data;
    const operation = AsyncOperationsStore.get(operationId);
    if (!operation) {
        console.error(`Missing operation for grantAccess with id ${operationId}`);
        return;
    }
    operation.reject(new MessageError("User declined access"));
}
