// GRANT ACCESS MESSAGES

export interface RequestWithOperation {
    operationId: number;
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
