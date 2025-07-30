import {
    getAllAccounts,
    getApplicationId,
    getIsHiddenMode,
    getSelectedConnection,
    saveAllAccounts,
    saveApplicationId,
} from "../../helpers/account";
import { Account } from "@shared/constants/types";
import { v4 as uuidv4 } from "uuid";
import { getUpdatedAccounts } from "../../helpers/getUpdatedAccounts";
import { updateSelectedConnection } from "../../helpers/updateSelectedConnection";

export async function loadState() {
    const currentAccounts: Account[] = await getAllAccounts();
    const allAccounts: Account[] = await getUpdatedAccounts(currentAccounts);
    await saveAllAccounts(allAccounts);

    let applicationId: string = await getApplicationId();
    if (!applicationId) {
        applicationId = uuidv4();
        await saveApplicationId(applicationId);
    }

    const isHiddenMode = await getIsHiddenMode();
    const savedConnection = await getSelectedConnection();

    const selectedConnection = await updateSelectedConnection(
        allAccounts,
        savedConnection,
    );

    return {
        allAccounts,
        applicationId,
        selectedConnection,
        isHiddenMode,
    };
}
