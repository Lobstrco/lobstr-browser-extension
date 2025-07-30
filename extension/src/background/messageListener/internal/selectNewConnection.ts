import { updateSelectedConnection } from "../../helpers/updateSelectedConnection";
import { getAllAccounts } from "../../helpers/account";
import { Account } from "@shared/constants/types";

export async function selectNewConnection(connectionKey: string) {
    const allAccounts: Account[] = await getAllAccounts();
    const selectedConnection = await updateSelectedConnection(
        allAccounts,
        connectionKey,
    );
    return { selectedConnection };
}
