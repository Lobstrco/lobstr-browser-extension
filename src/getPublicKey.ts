import { isBrowser } from "./internal/environment";
import { connectWallet } from "./internal/connect";
import { NetworkOptions } from "./internal/types";

export const getPublicKey = async (
    options: NetworkOptions = {},
): Promise<string> => {
    if (!isBrowser) {
        return "";
    }

    const { publicKey } = await connectWallet(options.network);

    return publicKey;
};
