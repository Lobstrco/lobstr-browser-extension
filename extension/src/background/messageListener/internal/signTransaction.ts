import { AsyncOperationsStore } from "../../helpers/asyncOperations";
import { RequestSignAdditional, RequestWithOperation, SignRequestResolve } from "@shared/constants/mesagesData.types";
import { signWithLobstr } from "@shared/api/lobstr-api";
import { allAccountsSelector, logIn } from "../../ducks/session";
import { saveAllAccounts } from "../../helpers/account";
import { store } from "../../store";
import { MessageError } from "../../helpers/messageError";

export async function signTransaction(data: RequestWithOperation) {
    const { operationId } = data;
    const operation = AsyncOperationsStore.get<SignRequestResolve, RequestSignAdditional>(operationId);
    if (!operation) {
        console.error(`Missing operation for transactionSign with id ${operationId}`);
        return;
    }
    const { transactionXdr, connectionKey, domain } = operation.getAdditionalData()!;

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
        const message: string = typeof e === 'string' ? e : 'Sign failed';
        operation.reject(new MessageError(message));
    }
}

async function _updateLastActivityTime(connectionKey: string): Promise<void>  {
    const currentState = store.getState();
    const allAccounts = allAccountsSelector(currentState);
    const allAccountsCopy = [...allAccounts];

    const activeAccountIndex = allAccounts.findIndex(
        ({ connectionKey: key }) => key === connectionKey,
    );

    if (activeAccountIndex === -1) {
        return;
    }
    allAccountsCopy[activeAccountIndex] = {
        ...allAccountsCopy[activeAccountIndex],
        ...{ lastActivityTime: Date.now() },
    };
    store.dispatch(logIn({ allAccounts: allAccountsCopy }));
    await saveAllAccounts(allAccountsCopy);
}