import { sign } from "./internal/requests";
import { isBrowser } from "./internal/environment";
import { NetworkOptions } from "./internal/types";
import { readConnectionKey } from "./internal/connectionKey";

/** Offered only where `getSupportedNetworks` lists `"message"` in `signTypes`. */
export const signMessage = async (
    message: string,
    options: NetworkOptions = {},
): Promise<{
    signedMessage: string;
    signerAddress: string;
} | null> => {
    if (!isBrowser) {
        return Promise.resolve(null);
    }

    const connectionKey = readConnectionKey(options.network);

    const result = await sign(
        message,
        connectionKey,
        "message",
        options.network,
    );
    return {
        signedMessage: result.signedData,
        signerAddress: result.signerAddress,
    };
};
