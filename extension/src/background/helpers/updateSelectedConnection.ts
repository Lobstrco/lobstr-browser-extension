import { Account } from "@shared/constants/types";
import { saveSelectedConnection } from "./account";

export async function updateSelectedConnection(allAccounts: Account[], currentConnection: string) {
    if (!allAccounts.length) {
        await saveSelectedConnection("");
        return "";
    }
    if (allAccounts.find((a) => a.connectionKey === currentConnection)) {
        return currentConnection;
    }

    const newConnection = allAccounts.sort(
        (a, b) => b.lastActivityTime - a.lastActivityTime,
    )[0].connectionKey;

    await saveSelectedConnection(newConnection);

    return newConnection;
}