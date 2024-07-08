import { isHiddenModeSelector, toggleHiddenMode } from "../../ducks/session";
import { saveIsHiddenMode } from "../../helpers/account";
import { store } from "../../store";

export async function toggleAppHiddenMode() {
    const newState = !isHiddenModeSelector(store.getState());
    await saveIsHiddenMode(newState);
    store.dispatch(toggleHiddenMode());

    return {
        isHiddenMode: newState,
    };
}