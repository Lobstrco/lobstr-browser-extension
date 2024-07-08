import {
    allAccountsSelector,
    applicationIdSelector,
    isHiddenModeSelector,
    isStorageCheckedSelector, loadSavedState, selectConnection, selectedConnectionSelector, setStorageChecked
} from "../../ducks/session";
import {
    getAllAccounts,
    getApplicationId, getIsHiddenMode, getSelectedConnection,
    saveAllAccounts,
    saveApplicationId
} from "../../helpers/account";
import { Account } from "@shared/constants/types";

import { store } from "background/store";
import { v4 as uuidv4 } from "uuid";
import { getUpdatedAccounts } from "../../helpers/getUpdatedAccounts";
import { updateSelectedConnection } from "../../helpers/updateSelectedConnection";

export async function loadState() {
    const currentState = store.getState();

    if (isStorageCheckedSelector(currentState)) {
        const allAccounts = await getUpdatedAccounts(
            allAccountsSelector(currentState),
        );
        const applicationId = applicationIdSelector(currentState);
        await saveAllAccounts(allAccounts);
        const isHiddenMode = isHiddenModeSelector(currentState);
        const savedConnection = selectedConnectionSelector(currentState);

        const selectedConnection = await updateSelectedConnection(
            allAccounts,
            savedConnection,
        );
        store.dispatch(
            selectConnection({ selectedConnection }),
        );

        store.dispatch(
            loadSavedState({
                allAccounts,
                applicationId,
                isHiddenMode,
                selectedConnection,
            }),
        );

        return {
            allAccounts,
            applicationId,
            isHiddenMode,
            selectedConnection,
        };
    }

    const allAccounts: Account[] = await getAllAccounts();
    const filteredAccounts = await getUpdatedAccounts(allAccounts);
    await saveAllAccounts(filteredAccounts);

    let applicationId: string = await getApplicationId();

    if (!applicationId) {
        applicationId = uuidv4();
        await saveApplicationId(applicationId);
    }

    const isHiddenMode = await getIsHiddenMode();
    const savedConnection = await getSelectedConnection();

    const selectedConnection = await updateSelectedConnection(
        filteredAccounts,
        savedConnection,
    );
    store.dispatch(
        selectConnection({ selectedConnection }),
    );

    store.dispatch(
        loadSavedState({
            allAccounts: filteredAccounts,
            applicationId,
            isHiddenMode,
            selectedConnection,
        }),
    );
    store.dispatch(setStorageChecked());

    return {
        allAccounts: filteredAccounts,
        applicationId,
        selectedConnection,
        isHiddenMode,
    };
}
