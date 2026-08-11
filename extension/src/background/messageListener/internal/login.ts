import { checkLogin } from "@shared/api/lobstr-api";
import { updateSelectedConnection } from "../../helpers/updateSelectedConnection";
import { saveAllAccounts, getAllAccounts } from "../../helpers/account";
import { getUpdatedAccounts } from "../../helpers/getUpdatedAccounts";
import { normalizeError } from "@shared/helpers/errors";
import {
    accountAlreadyConnectedMessage,
    ERROR_MESSAGES,
} from "@shared/constants/errorMessages";

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
            return { error: accountAlreadyConnectedMessage(connectionKey) };
        }

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
        console.error(e);
        // a fulfilled value the popup reads, so it must be the declared `error: string`
        return { error: normalizeError(e, ERROR_MESSAGES.LOGIN_FAILED) };
    }
}
