import { AllowedSenders } from "../../helpers/allowListAuthorization";
import { AsyncOperation, AsyncOperationsStore } from "../../helpers/asyncOperations";
import { GrantAccessData, GrantAccessResolve } from "@shared/constants/mesagesData.types";
import { missingOperationMessage } from "@shared/constants/errorMessages";

export async function grantAccess(data: GrantAccessData) {
    const { url, publicKey, connectionKey, operationId } = data;
    await AllowedSenders.addToList(url);

    const operation: AsyncOperation<GrantAccessResolve> | null = AsyncOperationsStore.get(operationId);
    if (!operation) {
        console.error(missingOperationMessage("grantAccess", operationId));
        return;
    }
    operation.resolve({ publicKey, connectionKey });
}