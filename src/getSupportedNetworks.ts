import { requestSupportedNetworks } from "./internal/requests";
import { NetworkId, SupportedNetwork } from "./networks";
import { isBrowser } from "./internal/environment";

/**
 * Ask before offering a network. Silence from an older extension is reported as
 * Stellar-only, not as a failure; a later one may add networks and fields this
 * bundle cannot name, so read what you recognise and skip the rest.
 */
export const getSupportedNetworks = (): Promise<SupportedNetwork[]> => {
    if (!isBrowser) {
        return Promise.resolve([]);
    }

    return requestSupportedNetworks();
};

/** Accepts a name this bundle predates: asking about one is the point. */
export const supportsNetwork = async (network: NetworkId): Promise<boolean> => {
    const supported = await getSupportedNetworks();
    return supported.some((entry) => entry.network === network);
};
