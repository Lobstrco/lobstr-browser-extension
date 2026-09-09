import * as requests from "../internal/requests";
import { CONNECTION_STORAGE_KEY } from "../internal/connectionKey";
import { ERROR_MESSAGES } from "../protocol/errors";
import { NETWORK } from "../networks";
import { getConnectedWallet } from "../getConnectedWallet";

const answer = (network) =>
    jest.spyOn(requests, "requestPublicKey", null).mockResolvedValue({
        publicKey: "GWALLET",
        connectionKey: "the-key",
        network,
    });

describe("connecting a wallet", () => {
    afterEach(() => {
        jest.restoreAllMocks();
        sessionStorage.clear();
    });

    it("files the key under the network that answered, not the one requested", async () => {
        answer(NETWORK.ripple);

        await getConnectedWallet({ network: NETWORK.ripple });

        expect(sessionStorage.getItem(`${CONNECTION_STORAGE_KEY}:ripple`)).toBe(
            "the-key",
        );
        expect(sessionStorage.getItem(CONNECTION_STORAGE_KEY)).toBeNull();
    });

    it("refuses a wallet from a network the page did not ask for", async () => {
        // an extension that predates networks answers any request with Stellar;
        // returning it would hand the page a chain it never asked for
        answer(NETWORK.stellar);

        // an Error, like every other business error: integrators compare `.message`;
        // an Error argument makes Jest compare the message exactly, not by substring
        await expect(
            getConnectedWallet({ network: NETWORK.ripple }),
        ).rejects.toThrow(new Error(ERROR_MESSAGES.NETWORK_MISMATCH));
        expect(sessionStorage.length).toBe(0);
    });

    it("refuses a non-Stellar wallet for a page that named no network", async () => {
        // absent means Stellar permanently, so there is always something to compare
        answer(NETWORK.ripple);

        await expect(getConnectedWallet()).rejects.toThrow(
            new Error(ERROR_MESSAGES.NETWORK_MISMATCH),
        );
        expect(sessionStorage.length).toBe(0);
    });

    it("refuses an answer that names no network at all", async () => {
        // present but empty is not absent; taking it for Stellar files a token blind
        answer("");

        await expect(getConnectedWallet()).rejects.toThrow(
            new Error(ERROR_MESSAGES.NETWORK_MISMATCH),
        );
        expect(sessionStorage.length).toBe(0);
    });

    it("accepts Stellar for a page that named no network", async () => {
        // absent means Stellar permanently, so this is a match, not a mismatch
        answer(NETWORK.stellar);

        await expect(getConnectedWallet()).resolves.toEqual({
            publicKey: "GWALLET",
            network: NETWORK.stellar,
        });
        expect(sessionStorage.getItem(CONNECTION_STORAGE_KEY)).toBe("the-key");
    });
});
