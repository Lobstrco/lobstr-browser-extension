import { signWithLobstr } from "@shared/api/lobstr-api";
import { MessageError, normalizeError } from "@shared/helpers/errors";
import { ERROR_MESSAGES } from "@shared/constants/errorMessages";
import {
    RequestSignAdditional,
    SignRequestResolve,
} from "@shared/constants/mesagesData.types";
import { Account } from "@shared/constants/types";
import { AsyncOperation } from "./asyncOperations";
import { findAccount, getAllAccounts, saveAllAccounts } from "./account";

/** Always answers, so the queue behind it is never left on an unsettled operation. */
export const runSignRequest = async (
    operation: AsyncOperation<SignRequestResolve, RequestSignAdditional>,
): Promise<void> => {
    try {
        const data = operation.getAdditionalData();
        if (!data) {
            operation.reject(new MessageError(ERROR_MESSAGES.SIGN_FAILED));
            return;
        }
        const { dataToSign, connectionKey, domain, signType } = data;

        // the page keeps its connection key across sessions; that wallet may be gone
        if (!(await findAccount(connectionKey))) {
            operation.reject(new MessageError(ERROR_MESSAGES.ACCOUNT_NOT_FOUND));
            return;
        }

        await updateLastActivityTime(connectionKey);

        const signedData = await signWithLobstr(
            dataToSign,
            connectionKey,
            domain,
            signType,
            operation.signal,
        );
        const signer = await findAccount(connectionKey);
        operation.resolve({
            signedData,
            signerAddress: signer?.publicKey || "",
        });
    } catch (e) {
        // the only place the real cause survives; the dApp gets a summary
        console.error(e);
        operation.reject(
            new MessageError(normalizeError(e, ERROR_MESSAGES.SIGN_FAILED)),
        );
    }
};

// a failure here only skews wallet ordering, so it must never abort a signature
const updateLastActivityTime = async (connectionKey: string): Promise<void> => {
    try {
        const allAccounts: Account[] = await getAllAccounts();
        const updatedAccounts: Account[] = allAccounts.map((account: Account) =>
            account.connectionKey === connectionKey
                ? { ...account, lastActivityTime: Date.now() }
                : account,
        );

        await saveAllAccounts(updatedAccounts);
    } catch (e) {
        console.error(e);
    }
};
