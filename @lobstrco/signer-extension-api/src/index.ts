import { getPublicKey } from "./getPublicKey";
import { signTransaction } from "./signTransaction";
import { isConnected } from "./isConnected";
import { signMessage } from "./signMessage";

export const isBrowser = typeof window !== "undefined";

export { getPublicKey, signTransaction, isConnected, signMessage };
export default {
    getPublicKey,
    signTransaction,
    isConnected,
    signMessage,
};
