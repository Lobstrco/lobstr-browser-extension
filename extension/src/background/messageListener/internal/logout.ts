import { logoutFromLobstr } from "@shared/api/lobstr-api";
import { updateSelectedConnection } from "../../helpers/updateSelectedConnection";
import {
    saveAllAccounts,
    getAllAccounts,
    getSelectedConnection,
} from "../../helpers/account";
import { Account } from "@shared/constants/types";

export async function logout(connectionKey: string) {
    const currentAccounts: Account[] = await getAllAccounts();
    const allAccounts: Account[] = currentAccounts.filter(
        (account: Account) => account.connectionKey !== connectionKey,
    );

    await logoutFromLobstr(connectionKey);
    await saveAllAccounts(allAccounts);

    const savedConnection = await getSelectedConnection();
    const selectedConnection = await updateSelectedConnection(
        allAccounts,
        savedConnection,
    );

    return {
        allAccounts,
        selectedConnection,
    };
}
