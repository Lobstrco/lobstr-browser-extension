import browser from "webextension-polyfill";
import { ROUTES } from "../../popup/constants/routes";
import { SERVICE_TYPES } from "@shared/constants/services";
import { MessageError } from "@shared/helpers/errors";
import { ERROR_MESSAGES } from "@shared/constants/errorMessages";
import {
    RequestSignAdditional,
    SignPromptState,
    SignRequestResolve,
} from "@shared/constants/mesagesData.types";
import { AsyncOperation } from "./asyncOperations";
import { PopupWindow } from "./popupWindow";
import { runSignRequest } from "./runSignRequest";

type SignOperation = AsyncOperation<SignRequestResolve, RequestSignAdditional>;

// insertion order is the queue order; the first entry is the one being signed
const queue: Map<string, SignOperation> = new Map();
let signed = 0;
let promptWindow: PopupWindow | null = null;

export const signPromptState = (): SignPromptState => ({
    requests: Array.from(queue.values()).map((operation) => {
        const { connectionKey, signType } = operation.getAdditionalData()!;
        return { connectionKey, signType };
    }),
    signed,
});

/** Only the head is sent on: the wallet shows one request and drops it when a new one arrives. */
export const queueSignRequest = (operation: SignOperation): void => {
    const startsIdle = !queue.size;
    queue.set(operation.id, operation);
    operation.onSettled(() => {
        if (operation.isResolved) {
            signed += 1;
        }
        queue.delete(operation.id);
        announceChange();
        signNextInQueue();
    });
    const promptShown = showPrompt();
    announceChange();
    if (startsIdle) {
        // nothing goes to the wallet before the user has a window to act on, and
        // a request declined while that window was opening is not sent at all
        promptShown
            .then(() => {
                if (queue.has(operation.id)) {
                    runSignRequest(operation);
                }
            })
            .catch(() => undefined);
    }
};

const signNextInQueue = (): void => {
    const next = queue.values().next().value as SignOperation | undefined;
    if (next) {
        runSignRequest(next);
        return;
    }
    signed = 0;
    closePrompt();
};

/** Resolves once there is a window to act on, so nothing is signed unseen. */
const showPrompt = (): Promise<unknown> => {
    if (promptWindow) {
        promptWindow.focus();
        return promptWindow.window;
    }
    const created = new PopupWindow(ROUTES.signModal);
    promptWindow = created;
    // both reports arrive long after we asked, by which time a new request may
    // already have opened its own window — neither may speak for that one
    created
        .onUnableToOpen(() => {
            if (promptWindow !== created) {
                return;
            }
            promptWindow = null;
            // a prompt that never appeared leaves nothing to act on
            declineAll(ERROR_MESSAGES.POPUP_OPEN_FAILED);
        })
        .onRemoved(() => {
            if (promptWindow !== created) {
                return;
            }
            promptWindow = null;
            declineAll(ERROR_MESSAGES.USER_DECLINED_ACCESS);
        });
    return created.window;
};

const closePrompt = (): void => {
    const closing = promptWindow;
    promptWindow = null;
    closing?.close();
};

// emptied before rejecting, so no settle handler starts the next request
const declineAll = (reason: string): void => {
    const abandoned = Array.from(queue.values());
    queue.clear();
    abandoned.forEach((operation) =>
        operation.reject(new MessageError(reason)),
    );
};

const announceChange = (): void => {
    // nobody is listening while the prompt is closed, and that is not an error
    browser.runtime
        .sendMessage({ type: SERVICE_TYPES.SIGN_PROMPT_STATE_CHANGED })
        .catch(() => undefined);
};
