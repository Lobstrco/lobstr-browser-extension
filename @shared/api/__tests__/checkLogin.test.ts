import { checkLogin, cancelLoginPolling } from "../lobstr-api";
import { get } from "../helpers/request";
import { ERROR_MESSAGES } from "@shared/constants/errorMessages";

jest.mock("../helpers/request", () => ({
    get: jest.fn(),
    post: jest.fn(),
    deleteRequest: jest.fn(),
}));

const mockedGet = get as jest.Mock;

const connection = {
    connection_key: "wallet-a",
    public_key: "GABC",
    federation_address: "me*lobstr.co",
    nickname: "Main",
    user_agent: "iOS",
    currency: "USD",
};

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
});

afterEach(() => {
    cancelLoginPolling();
    jest.useRealTimers();
});

describe("checkLogin", () => {
    it("returns the account once the connection appears", async () => {
        mockedGet.mockResolvedValue(connection);

        await expect(checkLogin("wallet-a")).resolves.toMatchObject({
            publicKey: "GABC",
            connectionKey: "wallet-a",
            federation: "me*lobstr.co",
            nickname: "Main",
            userAgent: "iOS",
            currency: "USD",
        });
        expect(mockedGet).toHaveBeenCalledTimes(1);
    });

    it("keeps polling while the connection does not exist yet", async () => {
        // a failed request is the normal "QR code not scanned yet" answer
        mockedGet
            .mockRejectedValueOnce(new Error("404: not found"))
            .mockRejectedValueOnce(new Error("404: not found"))
            .mockResolvedValueOnce(connection);

        const assertion = expect(checkLogin("wallet-a")).resolves.toMatchObject({
            connectionKey: "wallet-a",
        });
        await tick();
        await assertion;

        expect(mockedGet).toHaveBeenCalledTimes(3);
    });

    it("fires no further request once cancelled mid-wait", async () => {
        // the guard at the top of the loop is what stops it; without it the loop
        // wakes from delay() and polls once more before noticing
        mockedGet.mockRejectedValue(new Error("404: not found"));

        const assertion = expect(checkLogin("wallet-a")).rejects.toBe(
            ERROR_MESSAGES.LOGIN_CANCELLED,
        );
        await jest.advanceTimersByTimeAsync(0);
        expect(mockedGet).toHaveBeenCalledTimes(1);

        cancelLoginPolling();
        await assertion;

        await jest.advanceTimersByTimeAsync(60000);
        expect(mockedGet).toHaveBeenCalledTimes(1);
    });

    it("ends the previous poll when a new one starts", async () => {
        mockedGet.mockRejectedValue(new Error("404: not found"));

        const first = expect(checkLogin("wallet-a")).rejects.toBe(
            ERROR_MESSAGES.LOGIN_CANCELLED,
        );
        await jest.advanceTimersByTimeAsync(0);

        const second = expect(checkLogin("wallet-b")).rejects.toBe(
            ERROR_MESSAGES.LOGIN_CANCELLED,
        );
        await first;

        cancelLoginPolling();
        await second;
    });
});
