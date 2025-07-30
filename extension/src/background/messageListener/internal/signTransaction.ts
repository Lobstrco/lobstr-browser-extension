import { AsyncOperationsStore } from "../../helpers/asyncOperations";
import {
    RequestSignAdditional,
    RequestWithOperation,
    SignRequestResolve,
} from "@shared/constants/mesagesData.types";
import { signWithLobstr } from "@shared/api/lobstr-api";
import { saveAllAccounts, getAllAccounts } from "../../helpers/account";
import { MessageError } from "../../helpers/messageError";
import { Account } from "@shared/constants/types";

export async function signTransaction(data: RequestWithOperation) {
    const { operationId } = data;
    const operation = AsyncOperationsStore.get<
        SignRequestResolve,
        RequestSignAdditional
    >(operationId);
    if (!operation) {
        console.error(
            `Missing operation for transactionSign with id ${operationId}`,
        );
        return;
    }
    const { transactionXdr, connectionKey, domain } =
        operation.getAdditionalData()!;

    if (!transactionXdr) {
        operation.reject("transactionXDR is not exists");
        return;
    }

    await _updateLastActivityTime(connectionKey);

    try {
        const signedTransaction = await signWithLobstr(
            transactionXdr,
            connectionKey,
            domain,
        );
        operation.resolve({ signedTransaction });
    } catch (e) {
        const message: string = typeof e === "string" ? e : "Sign failed";
        operation.reject(new MessageError(message));
    }
}

async function _updateLastActivityTime(connectionKey: string): Promise<void> {
    const allAccounts: Account[] = await getAllAccounts();
    const updatedAccounts: Account[] = allAccounts.map((account: Account) =>
        account.connectionKey === connectionKey
            ? { ...account, lastActivityTime: Date.now() }
            : account,
    );

    await saveAllAccounts(updatedAccounts);
}
