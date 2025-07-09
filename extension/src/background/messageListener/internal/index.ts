import { Request } from "@shared/constants/types";
import { SERVICE_TYPES } from "@shared/constants/services";
import { grantAccess } from "./grantAccess";
import { rejectAccess } from "./rejectAccess";
import { loadState } from "./loadState";
import { toggleAppHiddenMode } from "./toggleAppHiddenMode";
import { getLumenQuotes } from "./getLumenQuotes";
import { loadCachedAssets } from "./loadCachedAssets";
import { signTransaction } from "./signTransaction";
import { rejectTransaction } from "./rejectTransaction";
import { processNewAssets } from "./processNewAssets";
import { login } from "./login";
import { selectNewConnection } from "./selectNewConnection";
import { logout } from "./logout";
import { cancelLoginPolling } from "./cancelLoginPolling";

export function internalMessagesListener(request: Request) {
    switch (request.type) {
        case SERVICE_TYPES.LOGIN:
            return login(request.uuid);
        case SERVICE_TYPES.LOGOUT:
            return logout(request.connectionKey);
        case SERVICE_TYPES.GRANT_ACCESS:
            return grantAccess(request.data);
        case SERVICE_TYPES.REJECT_ACCESS:
            return rejectAccess(request.data);
        case SERVICE_TYPES.LOAD_STATE:
            return loadState();
        case SERVICE_TYPES.SIGN_TRANSACTION:
            return signTransaction(request.data);
        case SERVICE_TYPES.REJECT_TRANSACTION:
            return rejectTransaction(request.data);
        case SERVICE_TYPES.PROCESS_NEW_ASSETS:
            return processNewAssets(request.assets);
        case SERVICE_TYPES.SELECT_CONNECTION:
            return selectNewConnection(request.connectionKey);
        case SERVICE_TYPES.GET_LUMEN_QUOTES:
            return getLumenQuotes();
        case SERVICE_TYPES.LOAD_CACHED_ASSETS:
            return loadCachedAssets();
        case SERVICE_TYPES.TOGGLE_HIDDEN_MODE:
            return toggleAppHiddenMode();
        case SERVICE_TYPES.CANCEL_LOGIN_POLLING:
            return cancelLoginPolling();
        default:
            return Promise.resolve();
    }
}