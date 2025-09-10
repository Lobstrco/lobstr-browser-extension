import { sign } from "@shared/api/external";
import { CONNECTION_KEY } from "@shared/constants/services";
import { isBrowser } from "./index";

const getConnectionKey = () =>
    window?.sessionStorage?.getItem(CONNECTION_KEY) || "";

export const signMessage = async (
    message: string,
): Promise<{
    signedMessage: string;
    signerAddress: string;
} | null> => {
    if (!isBrowser) {
        return Promise.resolve(null);
    }

    const connectionKey = getConnectionKey();

    const result = await sign(message, connectionKey, "message");
    return {
        signedMessage: result.signedData,
        signerAddress: result.signerAddress,
    };
};
