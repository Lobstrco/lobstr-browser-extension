// Imports nothing on purpose: `protocol/index.ts` re-exports this file, so any import here
// closes a cycle and leaves NETWORK undefined at runtime.

/** Values match the backend `Networks` enum verbatim; they travel over the wire. */
export enum NETWORK {
    stellar = "stellar",
    ripple = "ripple",
}

export const DEFAULT_NETWORK = NETWORK.stellar;

/** May name a network this build does not know; `string & {}` keeps completion. */
export type NetworkId = NETWORK | (string & {});

/** Absent is the only legacy Stellar; a value that is present is never rewritten. */
export const networkOrLegacy = (network: NetworkId | undefined): NetworkId =>
    network === undefined ? DEFAULT_NETWORK : network;

/** Open on purpose: new kinds ride the existing sign message, so older builds see unknown strings. */
export type SignType = "transaction" | "message" | (string & {});

export interface NetworkDescriptor {
    displayName: string;
    /** Ticker of the native asset, e.g. `"XLM"`. */
    nativeCode: string;
    nativeDecimals: number;
    /** Account page on the network's block explorer; append the address. */
    explorerAccountUrl: string;
    signTypes: SignType[];
    /** What signing resolves: `"dapp"` the signed envelope, `"wallet"` the transaction id. */
    broadcaster: "dapp" | "wallet";
    /** `false` is supported but down right now — unlike being absent from the list. */
    available: boolean;

    // declared ahead of use, so a page on today's SDK can read them from a later build

    /** Chains that share an implementation, e.g. `"evm"` for Ethereum + Base. */
    family?: string;
    /** CAIP-2 id, e.g. `"eip155:8453"` — metadata only, never part of identity. */
    caip2?: string;
    /** Absent means `"exact"`; EVM addresses compare case-insensitively. */
    addressComparison?: "exact" | "caseInsensitive" | (string & {});
    /** Absent means `"single"`; `"anchor"` stands for a rotating set (Bitcoin). */
    identityModel?: "single" | "anchor" | (string & {});
}

export interface SupportedNetwork extends NetworkDescriptor {
    network: NetworkId;
}
