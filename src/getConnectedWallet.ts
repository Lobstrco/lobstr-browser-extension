import { isBrowser } from "./internal/environment";
import { connectWallet } from "./internal/connect";
import { ConnectedWallet, NetworkOptions } from "./internal/types";

/** The address with the network it is on; `getPublicKey` returns the address alone. */
export const getConnectedWallet = (
    options: NetworkOptions = {},
): Promise<ConnectedWallet | null> =>
    isBrowser ? connectWallet(options.network) : Promise.resolve(null);
