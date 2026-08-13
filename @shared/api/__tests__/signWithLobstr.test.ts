import { signWithLobstr } from "../lobstr-api";
import { get, post } from "../helpers/request";
import { ERROR_MESSAGES } from "@shared/constants/errorMessages";

jest.mock("../helpers/request", () => ({
    get: jest.fn(),
    post: jest.fn(),
    deleteRequest: jest.fn(),
}));

const mockedGet = get as jest.Mock;
const mockedPost = post as jest.Mock;

const httpError = (status: number) =>
    Object.assign(new Error(`${status}: failed`), { response: { status } });

const sign = (signal: AbortSignal) =>
    signWithLobstr("xdr", "wallet-a", "example.com", "transaction", signal);

// drives the polling loop past its 5s waits without real time passing
const tick = async (times = 10): Promise<void> => {
    for (let i = 0; i < times; i++) {
        await jest.advanceTimersByTimeAsync(5000);
    }
};

beforeEach(() => {
    // resetAllMocks, not clearAllMocks: unconsumed mockOnce entries leak between tests
    jest.resetAllMocks();
    jest.useFakeTimers();
    mockedPost.mockResolvedValue({ id: "tx-1" });
});

afterEach(() => jest.useRealTimers());

describe("signWithLobstr", () => {
    it("returns the signed xdr as soon as the first poll reports it", async () => {
        mockedGet.mockResolvedValue({ state: "signed", xdr: "signed-xdr" });

        await expect(sign(new AbortController().signal)).resolves.toBe(
            "signed-xdr",
        );
        expect(mockedGet).toHaveBeenCalledTimes(1);
    });

    it("returns the signature rather than the xdr for a message", async () => {
        mockedGet.mockResolvedValue({ state: "signed", signature: "sig" });

        await expect(
            signWithLobstr(
                "hello",
                "wallet-a",
                "example.com",
                "message",
                new AbortController().signal,
            ),
        ).resolves.toBe("sig");
    });

    it("reports a rejection from the wallet as a declined request", async () => {
        mockedGet.mockResolvedValue({ state: "rejected" });

        await expect(sign(new AbortController().signal)).rejects.toBe(
            ERROR_MESSAGES.USER_DECLINED_ACCESS,
        );
    });

    it("retries a transient failure instead of hanging", async () => {
        mockedGet
            .mockRejectedValueOnce(httpError(503))
            .mockResolvedValueOnce({ state: "signed", xdr: "signed-xdr" });

        // the assertion has to be attached before the timers run, or the
        // settlement below counts as an unhandled rejection
        const assertion = expect(sign(new AbortController().signal)).resolves.toBe(
            "signed-xdr",
        );
        await tick();
        await assertion;

        expect(mockedGet).toHaveBeenCalledTimes(2);
    });

    it("gives up after a long run of failures rather than polling on", async () => {
        mockedGet.mockRejectedValue(httpError(503));

        const assertion = expect(
            sign(new AbortController().signal),
        ).rejects.toThrow("503: failed");
        await tick(30);
        await assertion;

        expect(mockedGet).toHaveBeenCalledTimes(12);
    });

    it("forgives failures that are separated by a success", async () => {
        // the streak must reset on success, or a merely flaky hour adds up to a kill.
        // more isolated failures here than the streak limit, none of them consecutive
        for (let i = 0; i < 15; i++) {
            mockedGet.mockRejectedValueOnce(httpError(503));
            mockedGet.mockResolvedValueOnce({ state: "pending" });
        }
        mockedGet.mockResolvedValue({ state: "signed", xdr: "signed-xdr" });

        const assertion = expect(sign(new AbortController().signal)).resolves.toBe(
            "signed-xdr",
        );
        await tick(40);
        await assertion;
    });

    it("does not retry a failure that cannot resolve itself", async () => {
        mockedGet.mockRejectedValue(httpError(404));

        await expect(sign(new AbortController().signal)).rejects.toThrow(
            "404: failed",
        );
        expect(mockedGet).toHaveBeenCalledTimes(1);
    });

    it("stops polling once the operation is aborted", async () => {
        const controller = new AbortController();
        mockedGet.mockResolvedValue({ state: "pending" });

        const assertion = expect(sign(controller.signal)).rejects.toBe(
            ERROR_MESSAGES.SIGN_REQUEST_CANCELLED,
        );
        await jest.advanceTimersByTimeAsync(0);
        const callsBeforeAbort = mockedGet.mock.calls.length;
        controller.abort();
        await assertion;

        await jest.advanceTimersByTimeAsync(60000);
        expect(mockedGet).toHaveBeenCalledTimes(callsBeforeAbort);
    });

    it("does not start at all when already aborted", async () => {
        const controller = new AbortController();
        controller.abort();

        await expect(sign(controller.signal)).rejects.toBe(
            ERROR_MESSAGES.SIGN_REQUEST_CANCELLED,
        );
    });
});
