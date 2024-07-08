import { allAccountsSelector, logOut, selectConnection, selectedConnectionSelector } from "../../ducks/session";
import { logoutFromLobstr } from "@shared/api/lobstr-api";
import { updateSelectedConnection } from "../../helpers/updateSelectedConnection";
import { store } from "../../store";
import { saveAllAccounts } from "../../helpers/account";

export async function logout(connectionKey: string) {
    const allAccounts = allAccountsSelector(store.getState());

    await logoutFromLobstr(connectionKey);

    const updatedAccounts = allAccounts.filter(
        ({ connectionKey: key }) => key !== connectionKey,
    );

    const savedConnection = selectedConnectionSelector(store.getState());
    const selectedConnection = await updateSelectedConnection(
        updatedAccounts,
        savedConnection,
    );
    store.dispatch(selectConnection({ selectedConnection }));
    store.dispatch(logOut({ allAccounts: updatedAccounts }));

    await saveAllAccounts(updatedAccounts);

    return {
        allAccounts: updatedAccounts,
        selectedConnection,
    };
}