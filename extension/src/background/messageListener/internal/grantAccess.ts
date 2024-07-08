import { AllowedSenders } from "../../helpers/allowListAuthorization";
import { AsyncOperation, AsyncOperationsStore } from "../../helpers/asyncOperations";
import { GrantAccessData, GrantAccessResolve } from "@shared/constants/mesagesData.types";

export async function grantAccess(data: GrantAccessData) {
    const { url, publicKey, connectionKey, operationId } = data;
    await AllowedSenders.addToList(url);

    const operation: AsyncOperation<GrantAccessResolve> | null = AsyncOperationsStore.get(operationId);
    if (!operation) {
        console.error(`Missing operation for grantAccess with id ${operationId}`);
        return;
    }
    operation.resolve({ publicKey, connectionKey });
}