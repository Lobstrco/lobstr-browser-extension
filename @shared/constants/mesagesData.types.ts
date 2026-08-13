// GRANT ACCESS MESSAGES

export interface RequestWithOperation {
    operationId: string;
}

export interface RequestAccessData extends RequestWithOperation {
    url: string;
}

export interface GrantAccessResolve {
    publicKey: string;
    connectionKey: string;
}

export interface GrantAccessData
    extends RequestAccessData,
        GrantAccessResolve {}

// SIGN TRANSACTION MESSAGES

export interface RequestSignAdditional {
    dataToSign: string;
    connectionKey: string;
    domain: string;
    signType: "transaction" | "message";
}

export interface PendingSignRequest {
    connectionKey: string;
    signType: "transaction" | "message";
}

/** Everything the shared prompt shows: what is waiting, and what is already done. */
export interface SignPromptState {
    /** Oldest first; the first entry is the one being signed right now. */
    requests: PendingSignRequest[];
    signed: number;
}

export interface SignRequestResolve {
    signedData: string;
    signerAddress: string;
}
