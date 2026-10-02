// The wire vocabulary shared by the SDK and the extension; the extension imports it from here.
export {
    EXTERNAL_MSG_REQUEST,
    EXTERNAL_MSG_RESPONSE,
    EXTERNAL_SERVICE_TYPES,
} from "./messages";
export { API_VERSION } from "./api-version";
export { ERROR_MESSAGES } from "./errors";
export type {
    ConnectionResponse,
    ExternalRequestTxV1,
    ExternalRequestTxV2,
    GetPublicKeyResponse,
} from "./types";
export { DEFAULT_NETWORK, NETWORK, networkOrLegacy } from "../networks";
export type {
    NetworkDescriptor,
    NetworkId,
    SignType,
    SupportedNetwork,
} from "../networks";
