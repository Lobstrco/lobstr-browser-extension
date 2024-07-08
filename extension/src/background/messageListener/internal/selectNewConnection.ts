import { allAccountsSelector, selectConnection } from "../../ducks/session";
import { updateSelectedConnection } from "../../helpers/updateSelectedConnection";
import { store } from "../../store";

export async function selectNewConnection(connectionKey: string) {
    const allAccounts = allAccountsSelector(store.getState());
    const selectedConnection = await updateSelectedConnection(
        allAccounts,
        connectionKey,
    );
    store.dispatch(selectConnection({ selectedConnection }));
    return { selectedConnection };
}