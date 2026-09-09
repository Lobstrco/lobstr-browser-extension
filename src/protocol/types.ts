import type { EXTERNAL_SERVICE_TYPES } from "./messages";
import type { API_VERSION } from "./api-version";
import type { NetworkId, SignType } from "../networks";

export interface GetPublicKeyResponse {
    publicKey: string;
    connectionKey: string;
}

/** What REQUEST_ACCESS answers with: the wallet's own network, not the one the page asked for. */
export interface ConnectionResponse extends GetPublicKeyResponse {
    network: NetworkId;
}

export interface ExternalRequestTxV1 {
    connectionKey: string;
    transactionXdr: string;
    type: EXTERNAL_SERVICE_TYPES;
}

export interface ExternalRequestTxV2 {
    dataToSign: string;
    connectionKey: string;
    signType: SignType;
    type: EXTERNAL_SERVICE_TYPES;
    version: API_VERSION;
    /** Optional forever, and wider than the enum: a page may name a network this build has not shipped; the answer is a refusal, not a type error. */
    network?: NetworkId;
}
