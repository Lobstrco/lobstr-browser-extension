import { selectConnection } from "../../ducks/session";
import { updateSelectedConnection } from "../../helpers/updateSelectedConnection";
import { store } from "../../store";
import { getAllAccounts } from "../../helpers/account";

export async function selectNewConnection(connectionKey: string) {
    const allAccounts = await getAllAccounts();
    const selectedConnection = await updateSelectedConnection(
        allAccounts,
        connectionKey,
    );
    store.dispatch(selectConnection({ selectedConnection }));
    return { selectedConnection };
}
