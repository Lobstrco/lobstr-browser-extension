import { checkLogin } from "@shared/api/lobstr-api";
import { allAccountsSelector, logIn, selectConnection, selectedConnectionSelector } from "../../ducks/session";
import { updateSelectedConnection } from "../../helpers/updateSelectedConnection";
import { store } from "../../store";
import { saveAllAccounts } from "../../helpers/account";
import { getUpdatedAccounts } from "../../helpers/getUpdatedAccounts";

export async function login(uuid: string) {
    try {
        const {
            publicKey,
            federation,
            connectionKey,
            userAgent,
            lastActivityTime,
            currency,
        } = await checkLogin(uuid);

        const allAccounts = allAccountsSelector(store.getState());

        const filteredAccounts = await getUpdatedAccounts(allAccounts);

        const updatedAccounts = [
            ...filteredAccounts,
            {
                publicKey,
                federation,
                connectionKey,
                userAgent,
                lastActivityTime,
                currency,
            },
        ];

        if (allAccounts.find(({ connectionKey: key }) => key === connectionKey)) {
            return { error: `${connectionKey} is already exists` };
        }

        const savedConnection = selectedConnectionSelector(store.getState());
        const selectedConnection = await updateSelectedConnection(
            updatedAccounts,
            savedConnection,
        );
        store.dispatch(selectConnection({ selectedConnection }));
        store.dispatch(logIn({ allAccounts: updatedAccounts }));

        await saveAllAccounts(updatedAccounts);

        return {
            allAccounts: updatedAccounts,
            selectedConnection,
        };
    } catch (e) {
        return { error: e };
    }
}