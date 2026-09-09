import {
    EXTERNAL_MSG_REQUEST,
    EXTERNAL_MSG_RESPONSE,
    EXTERNAL_SERVICE_TYPES,
} from "../protocol/messages";

interface Msg {
    [key: string]: any;
    type: EXTERNAL_SERVICE_TYPES;
}

const PROBE_TIMEOUT = 2000;

/** For when nothing replies: older builds drop unknown types without a word. */
const PROBE_FALLBACKS: Partial<Record<EXTERNAL_SERVICE_TYPES, unknown>> = {
    // nothing answers when LOBSTR is absent, and this is what pages call to find out
    [EXTERNAL_SERVICE_TYPES.REQUEST_CONNECTION_STATUS]: { isConnected: false },
    // silence means an extension from before multi-network support: Stellar only
    [EXTERNAL_SERVICE_TYPES.GET_SUPPORTED_NETWORKS]: { networks: null },
};

export const sendMessageToContentScript = (msg: Msg): Promise<any> => {
    // correlates the reply; without it concurrent calls all resolve with the first one back
    const MESSAGE_ID = Date.now() + Math.random();

    window.postMessage(
        { source: EXTERNAL_MSG_REQUEST, messageId: MESSAGE_ID, ...msg },
        window.location.origin,
    );
    return new Promise((resolve) => {
        let requestTimeout: ReturnType<typeof setTimeout> | undefined;

        const fallback = PROBE_FALLBACKS[msg.type];
        if (fallback !== undefined) {
            requestTimeout = setTimeout(() => {
                resolve(fallback);
                window.removeEventListener("message", messageListener);
            }, PROBE_TIMEOUT);
        }

        const messageListener = (event: { source: any; data: any }) => {
            if (event.source !== window) return;
            if (event?.data?.source !== EXTERNAL_MSG_RESPONSE) return;
            // post `messageId`, read `messagedId` — never rename one side, they ship separately
            if (event?.data?.messagedId !== MESSAGE_ID) return;

            resolve(event.data);
            window.removeEventListener("message", messageListener);
            clearTimeout(requestTimeout);
        };
        window.addEventListener("message", messageListener, false);
    });
};
