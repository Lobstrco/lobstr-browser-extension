import { requestConnectionStatus } from "./internal/requests";
import { isBrowser } from "./internal/environment";

export const isConnected = async (): Promise<boolean> => {
    if (!isBrowser) {
        return false;
    }

    return await requestConnectionStatus();
};
