import { describe, expect, it, vi } from "vitest";
import * as requests from "../internal/requests";
import { WALLET_REF_STORAGE_KEY } from "../internal/walletRef";
import { NETWORK } from "../networks";
import { getPublicKey } from "../getPublicKey";

vi.mock("../internal/requests", { spy: true });

describe("getPublicKey", () => {
    describe("success case", () => {
        const TEST_PUBLIC_KEY = "GXXXXXXX....XXXXXXX";
        const TEST_WALLET_REF = "xxxxx-xxxxxx-xxxxxx";

        // `network` is resolved by the call being mocked here, so it is never absent
        vi.mocked(requests.requestPublicKey).mockReturnValue({
            publicKey: TEST_PUBLIC_KEY,
            walletRef: TEST_WALLET_REF,
            network: NETWORK.stellar,
        });
        it("returns a publicKey", async () => {
            const publicKey = await getPublicKey();
            expect(publicKey).toBe(TEST_PUBLIC_KEY);
        });
        it("saves the wallet reference", () => {
            const savedKey = sessionStorage.getItem(WALLET_REF_STORAGE_KEY);

            expect(savedKey).toBe(TEST_WALLET_REF);
        });
    });

    describe("fail case", () => {
        const TEST_ERROR = "Error!";

        it("throws an error", async () => {
            vi.mocked(requests.requestPublicKey).mockImplementation(() => {
                throw TEST_ERROR;
            });
            // `.rejects` must be awaited or the assertion never runs
            await expect(getPublicKey()).rejects.toBe(TEST_ERROR);
        });
    });
});
