import { AsyncOperationsStore } from "../../helpers/asyncOperations";
import { RequestWithOperation } from "@shared/constants/mesagesData.types";

export function rejectTransaction(data: RequestWithOperation) {
    const { operationId } = data;
    const operation = AsyncOperationsStore.get(operationId);
    if (!operation) {
        console.error(`Missing operation for transactionSign with id ${operationId}`);
        return;
    }
    operation.reject("Associated account not found");
}
