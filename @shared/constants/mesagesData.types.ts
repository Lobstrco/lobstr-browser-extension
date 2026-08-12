// GRANT ACCESS MESSAGES

export interface RequestWithOperation {
    operationId: string;
}

/** Carries the connection so a handler can confirm the message targets its own operation. */
export interface RequestWithConnection extends RequestWithOperation {
    connectionKey: string;
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

export interface RequestSignData extends RequestWithOperation {
    connectionKey: string;
    signType: "transaction" | "message";
}

export interface RequestSignAdditional {
    dataToSign: string;
    connectionKey: string;
    domain: string;
    signType: "transaction" | "message";
}

export interface SignRequestResolve {
    signedData: string;
    signerAddress: string;
}
