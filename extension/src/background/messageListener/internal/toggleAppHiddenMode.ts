import { getIsHiddenMode, saveIsHiddenMode } from "../../helpers/account";

export async function toggleAppHiddenMode() {
    const currentState = await getIsHiddenMode();
    const newState = !currentState;
    await saveIsHiddenMode(newState);

    return {
        isHiddenMode: newState,
    };
}
