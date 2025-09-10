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

export async function sign(data: RequestWithOperation) {
    const { operationId } = data;
    const operation = AsyncOperationsStore.get<
        SignRequestResolve,
        RequestSignAdditional
    >(operationId);
    if (!operation) {
        console.error(`Missing operation for sign with id ${operationId}`);
        return;
    }
    const { dataToSign, connectionKey, domain, signType } =
        operation.getAdditionalData()!;

    if (!dataToSign) {
        return;
    }

    await _updateLastActivityTime(connectionKey);

    try {
        const signedData = await signWithLobstr(
            dataToSign,
            connectionKey,
            domain,
            signType,
        );
        const signerAddress = await _getSignerAddress(connectionKey);
        operation.resolve({ signedData, signerAddress });
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

async function _getSignerAddress(connectionKey: string): Promise<string> {
    const allAccounts: Account[] = await getAllAccounts();
    const foundAccount = allAccounts.find(
        (account: Account) => account.connectionKey === connectionKey,
    );
    return foundAccount?.publicKey || "";
}
