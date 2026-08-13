import browser from "webextension-polyfill";
import { queueSignRequest, signPromptState } from "../signPrompt";
import { PopupWindow } from "../popupWindow";
import { runSignRequest } from "../runSignRequest";
import { AsyncOperation } from "../asyncOperations";
import { ERROR_MESSAGES } from "@shared/constants/errorMessages";
import {
    RequestSignAdditional,
    SignRequestResolve,
} from "@shared/constants/mesagesData.types";

jest.mock("webextension-polyfill", () => ({
    __esModule: true,
    default: { runtime: { sendMessage: jest.fn() } },
}));
jest.mock("../runSignRequest", () => ({ runSignRequest: jest.fn() }));

// each fake window keeps its OWN handlers: a shared list cannot tell a window we
// already closed from the one that replaced it
let mockNextWindowFails = false;
// leaves the next window unopened until the test says so
let mockNextWindowPending = false;
jest.mock("../popupWindow", () => ({
    PopupWindow: jest.fn().mockImplementation(() => {
        const fails = mockNextWindowFails;
        const created: any = {
            closeHandlers: [] as Array<() => void>,
            failHandlers: [] as Array<() => void>,
            onUnableToOpen: jest.fn((cb: () => void) => {
                created.failHandlers.push(cb);
                return created;
            }),
            onRemoved: jest.fn((cb: () => void) => {
                created.closeHandlers.push(cb);
                return created;
            }),
            focus: jest.fn(),
            close: jest.fn(),
        };
        if (mockNextWindowPending) {
            created.window = new Promise((resolve) => {
                created.open = () => resolve({ id: 1 });
            });
        } else {
            created.window = fails
                ? Promise.reject(new Error("no window for you"))
                : Promise.resolve({ id: 1 });
        }
        created.window.catch(() => undefined);
        return created;
    }),
}));

const mockedPopupWindow = PopupWindow as unknown as jest.Mock;
const mockedRun = runSignRequest as jest.Mock;

const signRequest = (connectionKey: string) => {
    const operation = new AsyncOperation<
        SignRequestResolve,
        RequestSignAdditional
    >();
    operation.setAdditionalData({
        dataToSign: "xdr",
        connectionKey,
        domain: "example.com",
        signType: "transaction",
    });
    operation.promise.catch(() => undefined);
    return operation;
};

const signed = { signedData: "signed", signerAddress: "G..." };

const windowAt = (index: number) =>
    mockedPopupWindow.mock.results[index].value;

const openWindow = () => windowAt(mockedPopupWindow.mock.results.length - 1);

const closeByHand = (window = openWindow()) =>
    window.closeHandlers.forEach((cb: () => void) => cb());

const failToOpen = (window = openWindow()) =>
    window.failHandlers.forEach((cb: () => void) => cb());

// the head waits for its window, so the queue has to be given a turn to run
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
    jest.clearAllMocks();
    mockNextWindowFails = false;
    mockNextWindowPending = false;
    (browser.runtime.sendMessage as jest.Mock).mockResolvedValue(undefined);
});

// leave the module with nothing queued for the next test
afterEach(() => {
    mockedPopupWindow.mock.results.forEach(({ value }) =>
        value.closeHandlers.forEach((cb: () => void) => cb()),
    );
});

describe("the signing queue", () => {
    it("sends the first request once its window is up", async () => {
        const first = signRequest("wallet-a");

        queueSignRequest(first);
        await flush();

        expect(mockedRun).toHaveBeenCalledTimes(1);
        expect(mockedRun).toHaveBeenCalledWith(first);
    });

    it("holds a second request back until the first is done", async () => {
        const first = signRequest("wallet-a");
        const second = signRequest("wallet-b");
        queueSignRequest(first);
        queueSignRequest(second);
        await flush();

        // the wallet shows one request at a time, so only one may be in flight
        expect(mockedRun).toHaveBeenCalledTimes(1);

        first.resolve(signed);

        expect(mockedRun).toHaveBeenCalledTimes(2);
        expect(mockedRun).toHaveBeenLastCalledWith(second);
    });

    it("keeps the order two back-to-back requests arrived in", () => {
        const first = signRequest("wallet-a");
        const second = signRequest("wallet-b");
        const third = signRequest("wallet-c");
        queueSignRequest(first);
        queueSignRequest(second);
        queueSignRequest(third);

        expect(signPromptState().requests.map((r) => r.connectionKey)).toEqual([
            "wallet-a",
            "wallet-b",
            "wallet-c",
        ]);
    });

    it("promotes the oldest waiting request, not the newest", async () => {
        const first = signRequest("wallet-a");
        const second = signRequest("wallet-b");
        const third = signRequest("wallet-c");
        queueSignRequest(first);
        queueSignRequest(second);
        queueSignRequest(third);
        await flush();

        first.resolve(signed);

        // with only two queued this is indistinguishable from taking the last
        expect(mockedRun).toHaveBeenLastCalledWith(second);
    });

    it("survives a broadcast nobody is listening for", async () => {
        // runtime.sendMessage rejects whenever the prompt is closed
        (browser.runtime.sendMessage as jest.Mock).mockRejectedValue(
            new Error("Could not establish connection"),
        );
        const operation = signRequest("wallet-a");

        queueSignRequest(operation);
        operation.resolve(signed);
        await Promise.resolve();

        expect(signPromptState()).toEqual({ requests: [], signed: 0 });
    });

    it("moves on when a request fails rather than stalling the queue", async () => {
        const first = signRequest("wallet-a");
        const second = signRequest("wallet-b");
        queueSignRequest(first);
        queueSignRequest(second);
        await flush();

        first.reject("nope");

        expect(mockedRun).toHaveBeenLastCalledWith(second);
    });

    it("counts what has been signed and forgets what has not", () => {
        const first = signRequest("wallet-a");
        const second = signRequest("wallet-b");
        const third = signRequest("wallet-c");
        queueSignRequest(first);
        queueSignRequest(second);
        queueSignRequest(third);

        first.resolve(signed);
        second.reject("declined on the phone");

        expect(signPromptState()).toEqual({
            requests: [{ connectionKey: "wallet-c", signType: "transaction" }],
            signed: 1,
        });
    });

    it("opens one window and brings it forward for later requests", () => {
        queueSignRequest(signRequest("wallet-a"));
        const window = openWindow();

        queueSignRequest(signRequest("wallet-b"));

        expect(mockedPopupWindow).toHaveBeenCalledTimes(1);
        expect(window.focus).toHaveBeenCalledTimes(1);
    });

    it("closes the window and forgets the tally once the queue empties", () => {
        const operation = signRequest("wallet-a");
        queueSignRequest(operation);
        const window = openWindow();

        operation.resolve(signed);

        expect(window.close).toHaveBeenCalledTimes(1);
        expect(signPromptState()).toEqual({ requests: [], signed: 0 });
    });

    it("declines everything queued when the window is closed by hand", async () => {
        const first = signRequest("wallet-a");
        const second = signRequest("wallet-b");
        queueSignRequest(first);
        queueSignRequest(second);
        await flush();
        mockedRun.mockClear();

        closeByHand();

        await expect(first.promise).rejects.toMatchObject({
            error: ERROR_MESSAGES.USER_DECLINED_ACCESS,
        });
        await expect(second.promise).rejects.toMatchObject({
            error: ERROR_MESSAGES.USER_DECLINED_ACCESS,
        });
        // nothing may be sent to the wallet while the queue is being torn down
        expect(mockedRun).not.toHaveBeenCalled();
        expect(signPromptState().requests).toHaveLength(0);
    });

    it("ignores the close of a window it already replaced", async () => {
        // a page signing in a loop asks for the next signature while the browser
        // is still getting round to closing the drained window
        const first = signRequest("wallet-a");
        queueSignRequest(first);
        await flush();
        first.resolve(signed);

        const second = signRequest("wallet-b");
        queueSignRequest(second);
        const replacement = openWindow();

        closeByHand(windowAt(0));

        expect(signPromptState().requests).toHaveLength(1);
        expect(replacement.close).not.toHaveBeenCalled();
        second.resolve(signed);
        await expect(second.promise).resolves.toMatchObject({
            signedData: "signed",
        });
    });

    it("declines the whole queue when the window cannot be opened", async () => {
        // nothing appeared on screen, so nothing may be signed blind
        mockNextWindowFails = true;
        const first = signRequest("wallet-a");
        const second = signRequest("wallet-b");
        queueSignRequest(first);
        queueSignRequest(second);

        failToOpen(windowAt(0));
        await flush();

        await expect(first.promise).rejects.toMatchObject({
            error: ERROR_MESSAGES.POPUP_OPEN_FAILED,
        });
        await expect(second.promise).rejects.toMatchObject({
            error: ERROR_MESSAGES.POPUP_OPEN_FAILED,
        });
        expect(mockedRun).not.toHaveBeenCalled();
        expect(signPromptState()).toEqual({ requests: [], signed: 0 });
    });

    it("opens a new window for the next request after a failure", () => {
        mockNextWindowFails = true;
        const failed = signRequest("wallet-a");
        queueSignRequest(failed);
        failToOpen(windowAt(0));
        failed.promise.catch(() => undefined);

        mockNextWindowFails = false;
        queueSignRequest(signRequest("wallet-b"));

        expect(mockedPopupWindow).toHaveBeenCalledTimes(2);
    });

    it("ignores the open-failure of a window it already replaced", async () => {
        const first = signRequest("wallet-a");
        queueSignRequest(first);
        await flush();
        first.resolve(signed);

        const second = signRequest("wallet-b");
        queueSignRequest(second);
        await flush();
        const replacement = openWindow();

        failToOpen(windowAt(0));

        expect(signPromptState().requests).toHaveLength(1);
        expect(replacement.close).not.toHaveBeenCalled();
    });

    it("does not send a request declined while its window was opening", async () => {
        mockNextWindowPending = true;
        const operation = signRequest("wallet-a");
        queueSignRequest(operation);

        closeByHand();
        openWindow().open();
        await flush();

        await expect(operation.promise).rejects.toMatchObject({
            error: ERROR_MESSAGES.USER_DECLINED_ACCESS,
        });
        expect(mockedRun).not.toHaveBeenCalled();
    });

    it("starts over cleanly after the window was closed", async () => {
        queueSignRequest(signRequest("wallet-a"));
        closeByHand();
        mockedRun.mockClear();

        const fresh = signRequest("wallet-b");
        queueSignRequest(fresh);
        await flush();

        expect(mockedPopupWindow).toHaveBeenCalledTimes(2);
        expect(mockedRun).toHaveBeenCalledWith(fresh);
        expect(signPromptState().signed).toBe(0);
    });

    it("announces every change so an open prompt can refresh", () => {
        const operation = signRequest("wallet-a");
        queueSignRequest(operation);
        operation.resolve(signed);

        expect(browser.runtime.sendMessage).toHaveBeenCalledTimes(2);
    });
});
