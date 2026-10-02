import { getPublicKey } from "./getPublicKey";
import { getConnectedWallet } from "./getConnectedWallet";
import { getSupportedNetworks, supportsNetwork } from "./getSupportedNetworks";
import { signTransaction } from "./signTransaction";
import { isConnected } from "./isConnected";
import { signMessage } from "./signMessage";

export { isBrowser } from "./internal/environment";

export { NETWORK } from "./networks";
export type {
    SupportedNetwork,
    NetworkDescriptor,
    NetworkId,
    SignType,
} from "./networks";
export type { ConnectedWallet, NetworkOptions } from "./internal/types";

export {
    getPublicKey,
    getConnectedWallet,
    getSupportedNetworks,
    supportsNetwork,
    signTransaction,
    isConnected,
    signMessage,
};
// spelled out so the declaration names the functions instead of inlining their signatures
const api: {
    getPublicKey: typeof getPublicKey;
    getConnectedWallet: typeof getConnectedWallet;
    getSupportedNetworks: typeof getSupportedNetworks;
    supportsNetwork: typeof supportsNetwork;
    signTransaction: typeof signTransaction;
    isConnected: typeof isConnected;
    signMessage: typeof signMessage;
} = {
    getPublicKey,
    getConnectedWallet,
    getSupportedNetworks,
    supportsNetwork,
    signTransaction,
    isConnected,
    signMessage,
};
export default api;
