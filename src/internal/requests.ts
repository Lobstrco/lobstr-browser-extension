import { API_VERSION } from "../protocol/api-version";
import { EXTERNAL_SERVICE_TYPES } from "../protocol/messages";
import type { ConnectionResponse } from "../protocol/types";
import { NETWORK, networkOrLegacy } from "../networks";
import type { NetworkId, SignType, SupportedNetwork } from "../networks";
import { sendMessageToContentScript } from "./transport";

export const requestPublicKey = async (
    network?: NetworkId,
): Promise<ConnectionResponse> => {
    let response: Record<string, any> = {};
    try {
        response = await sendMessageToContentScript({
            type: EXTERNAL_SERVICE_TYPES.REQUEST_ACCESS,
            // only `undefined` is absent; an older extension must see its own message
            ...(network !== undefined ? { network } : {}),
            version: network !== undefined ? API_VERSION.V3 : API_VERSION.V2,
        });
    } catch (e) {
        console.error(e);
    }

    // an Error, not the bare string: a caller reading `.message` is the normal one
    if (response.error) {
        throw new Error(response.error);
    }
    // named one by one: this crosses into an untrusted page, so a new field must
    // be published on purpose rather than ride along
    return {
        publicKey: response.publicKey || "",
        walletRef: response.walletRef || "",
        network: networkOrLegacy(response.network),
    };
};

export const sign = async (
    dataToSign: string,
    walletRef: string,
    signType: SignType,
    network?: NetworkId,
): Promise<{ signedData: string; signerAddress: string }> => {
    let response: { signedData: string; signerAddress: string; error?: string };
    try {
        response = await sendMessageToContentScript({
            dataToSign,
            walletRef,
            signType,
            type: EXTERNAL_SERVICE_TYPES.SIGN,
            ...(network !== undefined ? { network } : {}),
            version: network !== undefined ? API_VERSION.V3 : API_VERSION.V2,
        });
    } catch (e) {
        console.error(e);
        throw e;
    }
    // an Error, not the bare string: a caller reading `.message` is the normal one
    if (response.error) {
        throw new Error(response.error);
    }
    return response;
};

export const requestConnectionStatus = async (): Promise<boolean> => {
    let response = {
        isConnected: false,
    };

    try {
        response = await sendMessageToContentScript({
            type: EXTERNAL_SERVICE_TYPES.REQUEST_CONNECTION_STATUS,
            version: API_VERSION.V2,
        });
    } catch (e) {
        console.error(e);
    }

    return response.isConnected;
};

/** What every extension released before multi-network support can do — a snapshot, never updated. */
const STELLAR_ONLY: SupportedNetwork[] = [
    {
        network: NETWORK.stellar,
        displayName: "Stellar",
        nativeCode: "XLM",
        nativeDecimals: 7,
        explorerAccountUrl: "https://stellar.expert/explorer/public/account/",
        signTypes: ["transaction", "message"],
        broadcaster: "dapp",
        available: true,
    },
];

export const requestSupportedNetworks = async (): Promise<
    SupportedNetwork[]
> => {
    let response: { networks: SupportedNetwork[] | null } = { networks: null };

    try {
        response = await sendMessageToContentScript({
            type: EXTERNAL_SERVICE_TYPES.GET_SUPPORTED_NETWORKS,
            version: API_VERSION.V3,
        });
    } catch (e) {
        console.error(e);
    }

    // no answer at all means an extension that never heard of this message
    return response?.networks || STELLAR_ONLY;
};
