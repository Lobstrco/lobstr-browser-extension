import { DEFAULT_NETWORK, NetworkId } from "../networks";

/** Permanent: already-published SDK bundles read this exact string. */
export const CONNECTION_STORAGE_KEY = "LOBSTR_CONNECTION_KEY";

/** Stellar keeps the bare name, or every published bundle loses its connection. */
export const getConnectionStorageKey = (network: string): string =>
    network === "stellar"
        ? CONNECTION_STORAGE_KEY
        : `${CONNECTION_STORAGE_KEY}:${network}`;

export const saveConnectionKey = (
    connectionKey: string,
    network: NetworkId = DEFAULT_NETWORK,
): void => {
    window?.sessionStorage?.setItem(
        getConnectionStorageKey(network),
        connectionKey,
    );
};

export const readConnectionKey = (
    network: NetworkId = DEFAULT_NETWORK,
): string =>
    window?.sessionStorage?.getItem(getConnectionStorageKey(network)) || "";
