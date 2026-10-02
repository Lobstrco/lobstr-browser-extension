import { sign } from "./internal/requests";
import { isBrowser } from "./internal/environment";
import { NetworkOptions } from "./internal/types";
import { readWalletRef } from "./internal/walletRef";

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

    const walletRef = readWalletRef(options.network);

    const result = await sign(message, walletRef, "message", options.network);
    return {
        signedMessage: result.signedData,
        signerAddress: result.signerAddress,
    };
};
