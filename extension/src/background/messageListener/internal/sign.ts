import { AsyncOperationsStore } from "../../helpers/asyncOperations";
import {
    RequestSignAdditional,
    RequestWithConnection,
    SignRequestResolve,
} from "@shared/constants/mesagesData.types";
import { signWithLobstr } from "@shared/api/lobstr-api";
import { saveAllAccounts, getAllAccounts } from "../../helpers/account";
import { MessageError, normalizeError } from "@shared/helpers/errors";
import {
    ERROR_MESSAGES,
    mismatchedConnectionMessage,
    missingOperationMessage,
} from "@shared/constants/errorMessages";
import { Account } from "@shared/constants/types";

export async function sign(data: RequestWithConnection) {
    const { operationId } = data;
    const operation = AsyncOperationsStore.get<
        SignRequestResolve,
        RequestSignAdditional
    >(operationId);
    if (!operation) {
        console.error(missingOperationMessage("sign", operationId));
        return;
    }
    const additionalData = operation.getAdditionalData();
    // a popup outliving a worker restart must not drive somebody else's operation
    if (!additionalData || additionalData.connectionKey !== data.connectionKey) {
        console.error(mismatchedConnectionMessage("sign", operationId));
        return;
    }
    const { dataToSign, connectionKey, domain, signType } = additionalData;

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
        // the only place the real cause survives — the dApp gets a safe summary
        console.error(e);
        operation.reject(
            new MessageError(normalizeError(e, ERROR_MESSAGES.SIGN_FAILED)),
        );
    }
}

// a failure here only skews wallet ordering, so it must never abort a signature
async function _updateLastActivityTime(connectionKey: string): Promise<void> {
    try {
        await _writeLastActivityTime(connectionKey);
    } catch (e) {
        console.error(e);
    }
}

async function _writeLastActivityTime(connectionKey: string): Promise<void> {
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
