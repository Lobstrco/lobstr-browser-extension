import { requestPublicKey } from "./requests";
import { ERROR_MESSAGES } from "../protocol/errors";
import { NetworkId, networkOrLegacy } from "../networks";
import { saveConnectionKey } from "./connectionKey";

interface ConnectedWalletReply {
    publicKey: string;
    network: NetworkId;
}

/**
 * The one place a connection is accepted and filed.
 *
 * An extension that predates networks answers any request with a Stellar wallet,
 * and returning that would hand the caller a chain it never asked for.
 */
export const connectWallet = async (
    requested?: NetworkId,
): Promise<ConnectedWalletReply> => {
    const { publicKey, connectionKey, network } =
        await requestPublicKey(requested);

    // `requestPublicKey` already resolved the answer; only the ask can still be absent
    if (network !== networkOrLegacy(requested)) {
        // an Error, like every other business error: integrators compare `.message`
        throw new Error(ERROR_MESSAGES.NETWORK_MISMATCH);
    }

    saveConnectionKey(connectionKey, network);

    return { publicKey, network };
};
