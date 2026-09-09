import { sign } from "./internal/requests";
import { isBrowser } from "./internal/environment";
import { NetworkOptions } from "./internal/types";
import { readConnectionKey } from "./internal/connectionKey";

/**
 * `transaction` is a string in the network's own grammar — a base64 envelope on
 * Stellar, transaction JSON on the XRP Ledger. What resolves follows that
 * network's `broadcaster` from `getSupportedNetworks`: the signed transaction
 * for you to submit, or the id of one the wallet already sent.
 */
export const signTransaction = async (
    transaction: string,
    options: NetworkOptions = {},
): Promise<string> => {
    if (!isBrowser) {
        return Promise.resolve("");
    }

    const connectionKey = readConnectionKey(options.network);

    const result = await sign(
        transaction,
        connectionKey,
        "transaction",
        options.network,
    );
    return result.signedData;
};
