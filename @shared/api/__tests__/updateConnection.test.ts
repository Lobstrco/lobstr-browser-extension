import { updateConnection } from "../lobstr-api";
import { get } from "../helpers/request";
import { Account } from "@shared/constants/types";

jest.mock("../helpers/request", () => ({
    get: jest.fn(),
    post: jest.fn(),
    deleteRequest: jest.fn(),
}));

const mockedGet = get as jest.Mock;

const stored: Account = {
    publicKey: "GOLD",
    connectionKey: "wallet-a",
    federation: "old*lobstr.co",
    nickname: "Old name",
    userAgent: "iOS",
    lastActivityTime: 111,
    currency: "USD" as Account["currency"],
};

const fresh = {
    connection_key: "wallet-a",
    public_key: "GNEW",
    federation_address: "new*lobstr.co",
    nickname: "New name",
    user_agent: "Android",
    currency: "EUR",
};

beforeEach(() => jest.resetAllMocks());

describe("updateConnection", () => {
    it("returns the connection as the server now describes it", async () => {
        mockedGet.mockResolvedValue(fresh);

        await expect(updateConnection(stored)).resolves.toEqual({
            publicKey: "GNEW",
            connectionKey: "wallet-a",
            federation: "new*lobstr.co",
            nickname: "New name",
            userAgent: "Android",
            currency: "EUR",
        });
    });

    it("reports a revoked connection as gone", async () => {
        // null is what makes the caller drop the wallet from the list
        mockedGet.mockRejectedValue(
            Object.assign(new Error("404: gone"), { response: { status: 404 } }),
        );

        await expect(updateConnection(stored)).resolves.toBeNull();
    });

    it("keeps the stored connection when the server cannot be reached", async () => {
        // anything other than 404 must not cost the user a wallet
        mockedGet.mockRejectedValue(
            Object.assign(new Error("500: boom"), { response: { status: 500 } }),
        );

        await expect(updateConnection(stored)).resolves.toBe(stored);
    });

    it("keeps the stored connection when the failure carries no status", async () => {
        mockedGet.mockRejectedValue(new Error("offline"));

        await expect(updateConnection(stored)).resolves.toBe(stored);
    });
});
