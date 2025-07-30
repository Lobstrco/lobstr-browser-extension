import { checkLogin } from "@shared/api/lobstr-api";
import { updateSelectedConnection } from "../../helpers/updateSelectedConnection";
import { saveAllAccounts, getAllAccounts } from "../../helpers/account";
import { getUpdatedAccounts } from "../../helpers/getUpdatedAccounts";

export async function login(uuid: string) {
    try {
        const {
            publicKey,
            federation,
            nickname,
            connectionKey,
            userAgent,
            lastActivityTime,
            currency,
        } = await checkLogin(uuid);

        const allAccounts = await getAllAccounts();
        const filteredAccounts = await getUpdatedAccounts(allAccounts);

        const updatedAccounts = [
            ...filteredAccounts,
            {
                publicKey,
                federation,
                nickname,
                connectionKey,
                userAgent,
                lastActivityTime,
                currency,
            },
        ];

        const accountExists = allAccounts.find(
            (account: { connectionKey: string }) =>
                account.connectionKey === connectionKey,
        );
        if (accountExists) {
            return { error: `${connectionKey} is already exists` };
        }

        // Update selected account to a new account
        const selectedConnection = await updateSelectedConnection(
            updatedAccounts,
            connectionKey,
        );

        await saveAllAccounts(updatedAccounts);

        return {
            allAccounts: updatedAccounts,
            selectedConnection,
        };
    } catch (e) {
        return { error: e };
    }
}
