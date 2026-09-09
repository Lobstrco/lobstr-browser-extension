import { describe, expect, it, vi } from "vitest";
import * as requests from "../internal/requests";
import { signTransaction } from "../signTransaction";
import { getPublicKey } from "../getPublicKey";
import { NETWORK } from "../networks";

vi.mock("../internal/requests", { spy: true });

describe("signTransaction", () => {
    describe("success case", () => {
        const INITIAL_XDR = "unsigned";
        const SIGNED_XDR = "signed";
        const TEST_CONNECTION_KEY = "xxxx-xxxx-xxxx";
        const TEST_SIGNER_ADDRESS = "GXXXXXXX....XXXXXXX";

        // call getPublicKey to test saving connectionKey
        // `network` is resolved by the call being mocked here, so it is never absent
        vi.mocked(requests.requestPublicKey).mockReturnValue({
            connectionKey: TEST_CONNECTION_KEY,
            network: NETWORK.stellar,
        });
        getPublicKey();

        vi.mocked(requests.sign).mockReturnValue(
            Promise.resolve({
                signedData: SIGNED_XDR,
                signerAddress: TEST_SIGNER_ADDRESS,
            }),
        );

        it("returns a transaction", async () => {
            const transaction = await signTransaction(INITIAL_XDR);
            expect(transaction).toBe(SIGNED_XDR);
        });
        it("called with xdr, connectionKey and signType", async () => {
            await signTransaction(INITIAL_XDR);

            // no network: a one-argument call is a Stellar call, permanently
            expect(requests.sign).toHaveBeenLastCalledWith(
                INITIAL_XDR,
                TEST_CONNECTION_KEY,
                "transaction",
                undefined,
            );
        });

        it("passes an explicitly requested network through", async () => {
            await signTransaction(INITIAL_XDR, { network: NETWORK.ripple });

            expect(requests.sign).toHaveBeenLastCalledWith(
                INITIAL_XDR,
                // the ripple slot is empty, so this call carries no connection key
                "",
                "transaction",
                NETWORK.ripple,
            );
        });
    });

    describe("fail case", () => {
        it("propagates whatever the transport rejects with", async () => {
            const TEST_ERROR = "Error!";
            vi.mocked(requests.sign).mockImplementation(() => {
                throw TEST_ERROR;
            });
            // the transport already shaped the rejection; this layer must not re-wrap it
            await expect(signTransaction("unsigned")).rejects.toBe(TEST_ERROR);
        });
    });
});
