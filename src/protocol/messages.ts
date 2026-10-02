// Imports nothing on purpose: the extension re-exports this file, so any import here
// closes a cycle and leaves the enum undefined at runtime.

/** Message types a page may send. Matched by key in the content script, so each value equals its key. */
export enum EXTERNAL_SERVICE_TYPES {
    REQUEST_ACCESS = "REQUEST_ACCESS",
    SIGN = "SIGN",
    /** The old name of SIGN_TRANSACTION; still answered. */
    SUBMIT_TRANSACTION = "SUBMIT_TRANSACTION",
    SIGN_TRANSACTION = "SIGN_TRANSACTION",
    REQUEST_CONNECTION_STATUS = "REQUEST_CONNECTION_STATUS",
    GET_SUPPORTED_NETWORKS = "GET_SUPPORTED_NETWORKS",
}

/** `source` of every request a page posts and of every reply; published bundles send these verbatim. */
export const EXTERNAL_MSG_REQUEST = "LOBSTR_EXTERNAL_MSG_REQUEST";
export const EXTERNAL_MSG_RESPONSE = "LOBSTR_EXTERNAL_MSG_RESPONSE";
