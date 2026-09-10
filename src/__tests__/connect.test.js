import { afterEach, describe, expect, it, vi } from "vitest";
import * as requests from "../internal/requests";
import { WALLET_REF_STORAGE_KEY } from "../internal/walletRef";
import { ERROR_MESSAGES } from "../protocol/errors";
import { NETWORK } from "../networks";
import { getConnectedWallet } from "../getConnectedWallet";

// the wallet answer is what these tests vary, so the request layer is spied, not the transport
vi.mock("../internal/requests", { spy: true });

const answer = (network) =>
    vi.mocked(requests.requestPublicKey).mockResolvedValue({
        publicKey: "GWALLET",
        walletRef: "the-key",
        network,
    });

describe("connecting a wallet", () => {
    afterEach(() => {
        vi.resetAllMocks();
        sessionStorage.clear();
    });

    it("files the key under the network that answered, not the one requested", async () => {
        answer(NETWORK.ripple);

        await getConnectedWallet({ network: NETWORK.ripple });

        expect(sessionStorage.getItem(`${WALLET_REF_STORAGE_KEY}:ripple`)).toBe(
            "the-key",
        );
        expect(sessionStorage.getItem(WALLET_REF_STORAGE_KEY)).toBeNull();
    });

    it("refuses a wallet from a network the page did not ask for", async () => {
        // an extension that predates networks answers any request with Stellar;
        // returning it would hand the page a chain it never asked for
        answer(NETWORK.stellar);

        // an Error, like every other business error: integrators compare `.message`;
        // an Error argument makes the matcher compare the message exactly, not by substring
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
        expect(sessionStorage.getItem(WALLET_REF_STORAGE_KEY)).toBe("the-key");
    });

    it("clears the cell an older bundle left the real pairing key in", async () => {
        // same tab, older bundle first: that value is the backend credential
        sessionStorage.setItem("LOBSTR_CONNECTION_KEY", "the-real-key");
        answer(NETWORK.stellar);

        await getConnectedWallet();

        expect(sessionStorage.getItem("LOBSTR_CONNECTION_KEY")).toBeNull();
    });
});
