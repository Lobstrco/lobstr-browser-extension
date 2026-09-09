// Every value reaches dApps verbatim and is frozen once published — integrators match `error.message` on them
export const ERROR_MESSAGES = {
    /** One string for both "closed the prompt" and "rejected in the app" — same dApp reaction. */
    USER_DECLINED_ACCESS: "User declined access",
    CONNECTION_KEY_MISSING: "The connection key is missing",
    DATA_TO_SIGN_MISSING: "The data to sign is missing",
    POPUP_OPEN_FAILED: "Couldn't open access prompt",
    ACCOUNT_NOT_FOUND: "Associated account not found",
    /** Deliberately vague — keeps HTTP and server text out of third-party dApp UIs. */
    SIGN_FAILED: "Sign failed",
    SIGN_REQUEST_TIMEOUT: "Signing request timed out",
    MESSAGING_UNAVAILABLE: "Unable to send message to extension",

    // one distinct string per cause, so an integrator can branch instead of parsing "Sign failed"

    NETWORK_NOT_SUPPORTED: "Network is not supported",
    NETWORK_MISMATCH: "The connected wallet belongs to a different network",
    NO_WALLET_ON_NETWORK: "No wallet connected on the requested network",
    /** Kind-neutral on purpose: one literal must serve every kind added later. */
    SIGN_TYPE_NOT_SUPPORTED:
        "This type of signing is not supported on this network",
    INVALID_TRANSACTION_PAYLOAD:
        "The transaction payload is not valid for this network",
    PAYLOAD_TOO_LARGE: "The transaction payload is too large",
    /** A message type this build predates — answered, so a later SDK need not time out. */
    REQUEST_NOT_SUPPORTED: "This request type is not supported",
} as const;
