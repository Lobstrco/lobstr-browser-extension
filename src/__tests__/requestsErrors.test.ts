import { requestPublicKey, sign } from "../internal/requests";
import { sendMessageToContentScript } from "../internal/transport";

jest.mock("../internal/transport", () => ({
    sendMessageToContentScript: jest.fn(),
}));

const mockedSend = sendMessageToContentScript as jest.Mock;

const calls: [string, () => Promise<unknown>][] = [
    ["requestPublicKey", () => requestPublicKey()],
    ["sign", () => sign("xdr", "key", "transaction")],
];

beforeEach(() => jest.resetAllMocks());

describe("what a dApp catches", () => {
    it.each(calls)(
        "%s rejects with an Error, not the bare string",
        async (_label, call) => {
            // a page reading `.message` is the normal caller; a thrown string leaves it undefined
            mockedSend.mockResolvedValue({
                error: "The transaction has no Account.",
            });

            await expect(call()).rejects.toBeInstanceOf(Error);
        },
    );

    it.each(calls)(
        "%s carries the reason in `message`",
        async (_label, call) => {
            mockedSend.mockResolvedValue({
                error: "The transaction has no Account.",
            });

            await expect(call()).rejects.toThrow(
                "The transaction has no Account.",
            );
        },
    );

    it.each(calls)(
        "%s stringifies as `Error: <reason>`",
        async (_label, call) => {
            // the shape a template literal renders, which is what callers logged before
            mockedSend.mockResolvedValue({
                error: "The transaction has no Account.",
            });

            await expect(call()).rejects.toEqual(
                expect.objectContaining({
                    message: "The transaction has no Account.",
                }),
            );
            await call().catch((thrown) => {
                expect(String(thrown)).toBe(
                    "Error: The transaction has no Account.",
                );
            });
        },
    );

    it.each(calls)(
        "%s stays silent when there is no error",
        async (_label, call) => {
            mockedSend.mockResolvedValue({
                publicKey: "G",
                connectionKey: "k",
                signedData: "blob",
            });

            await expect(call()).resolves.toBeDefined();
        },
    );
});
