import { Account } from "@shared/constants/types";
import { saveSelectedConnection } from "./account";
import { store } from "../store";
import { selectConnection } from "../ducks/session";

export async function updateSelectedConnection(allAccounts: Account[], currentConnection: string) {
    if (!allAccounts.length) {
        await saveSelectedConnection("");
        store.dispatch(selectConnection({ selectedConnection: "" }));
        return "";
    }
    if (allAccounts.find((a) => a.connectionKey === currentConnection)) {
        await saveSelectedConnection(currentConnection);
        store.dispatch(
            selectConnection({ selectedConnection: currentConnection }),
        );
        return currentConnection;
    }

    const newConnection = allAccounts.sort(
        (a, b) => b.lastActivityTime - a.lastActivityTime,
    )[0].connectionKey;

    await saveSelectedConnection(newConnection);

    return newConnection;
}