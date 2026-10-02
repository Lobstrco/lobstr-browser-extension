import { NetworkId } from "../networks";

export interface NetworkOptions {
    /** Omit for Stellar — that is what every caller before v3 meant, permanently. */
    network?: NetworkId;
}

export interface ConnectedWallet {
    publicKey: string;
    network: NetworkId;
}
