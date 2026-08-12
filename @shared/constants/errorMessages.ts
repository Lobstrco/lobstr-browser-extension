// dApp-visible values ship verbatim in the published SDK — integrators string-match on them
export const ERROR_MESSAGES = {
    // dApp-visible: rejected out of the published SDK

    /** One string for both "closed the prompt" and "rejected in the app" — same dApp reaction. */
    USER_DECLINED_ACCESS: "User declined access",
    CONNECTION_KEY_MISSING: "The connection key is missing",
    DATA_TO_SIGN_MISSING: "The data to sign is missing",
    POPUP_OPEN_FAILED: "Couldn't open access prompt",
    ACCOUNT_NOT_FOUND: "Associated account not found",
    /** Deliberately vague — keeps HTTP and server text out of third-party dApp UIs. */
    SIGN_FAILED: "Sign failed",
    /** These two were masked as SIGN_FAILED and never reached a dApp, so the wording was free to change. */
    SIGN_REQUEST_SUPERSEDED: "Signing request was replaced by a newer one",
    SIGN_REQUEST_TIMEOUT: "Signing request timed out",
    MESSAGING_UNAVAILABLE: "Unable to send message to extension",

    // popup-only

    CONNECTION_TIMEOUT: "Connection timeout",
    LOAD_STATE_FAILED: "Couldn't load the extension state",
    LOGIN_FAILED: "Couldn't connect the wallet",
    LOGOUT_FAILED: "Couldn't disconnect the wallet",
    SELECT_CONNECTION_FAILED: "Couldn't switch the wallet",
    TOGGLE_HIDDEN_MODE_FAILED: "Couldn't change the display mode",
    ASSETS_LOAD_FAILED: "Couldn't load assets",
} as const;

export const accountAlreadyConnectedMessage = (connectionKey: string): string =>
    `${connectionKey} is already connected`;

/** Console-only: an operation id arrived that the store no longer holds. */
export const missingOperationMessage = (
    action: string,
    operationId: string,
): string => `Missing operation for ${action} with id ${operationId}`;

/** Console-only: a message targeted an operation belonging to another connection. */
export const mismatchedConnectionMessage = (
    action: string,
    operationId: string,
): string => `Connection mismatch for ${action} with id ${operationId}`;
