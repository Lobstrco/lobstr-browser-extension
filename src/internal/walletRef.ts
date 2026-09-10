import { DEFAULT_NETWORK, NetworkId } from "../networks";

/** Deliberately not the older name: a site that upgrades re-prompts once instead of reusing it. */
export const WALLET_REF_STORAGE_KEY = "LOBSTR_WALLET_REF";

/** Stellar keeps the bare name so one page can hold a wallet per network. */
export const getWalletRefStorageKey = (network: string): string =>
    network === "stellar"
        ? WALLET_REF_STORAGE_KEY
        : `${WALLET_REF_STORAGE_KEY}:${network}`;

/** What a bundle published before the rename wrote here: the pairing key itself. */
const LEGACY_STORAGE_KEY = "LOBSTR_CONNECTION_KEY";

export const saveWalletRef = (
    walletRef: string,
    network: NetworkId = DEFAULT_NETWORK,
): void => {
    window?.sessionStorage?.setItem(getWalletRefStorageKey(network), walletRef);
    // a tab that ran the older bundle first still holds the real key in its cell
    window?.sessionStorage?.removeItem(LEGACY_STORAGE_KEY);
};

export const readWalletRef = (network: NetworkId = DEFAULT_NETWORK): string =>
    window?.sessionStorage?.getItem(getWalletRefStorageKey(network)) || "";
