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

export interface GrantAccessData extends RequestAccessData, GrantAccessResolve {}

// SIGN TRANSACTION MESSAGES

export interface RequestSignData extends RequestWithOperation {
    connectionKey: string;
}

export interface RequestSignAdditional {
    transactionXdr: string;
    connectionKey: string;
    domain: string;
}

export interface SignRequestResolve {
    signedTransaction: string;
}