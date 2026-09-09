import * as requests from "../internal/requests";
import { signTransaction } from "../signTransaction";
import { getPublicKey } from "../getPublicKey";
import { NETWORK } from "../networks";

describe("signTransaction", () => {
    describe("success case", () => {
        const INITIAL_XDR = "unsigned";
        const SIGNED_XDR = "signed";
        const TEST_CONNECTION_KEY = "xxxx-xxxx-xxxx";
        const TEST_SIGNER_ADDRESS = "GXXXXXXX....XXXXXXX";

        // call getPublicKey to test saving connectionKey
        // `network` is resolved by the call being mocked here, so it is never absent
        jest.spyOn(requests, "requestPublicKey", null).mockReturnValue({
            connectionKey: TEST_CONNECTION_KEY,
            network: NETWORK.stellar,
        });
        getPublicKey();

        jest.spyOn(requests, "sign", null).mockReturnValue(
            Promise.resolve({
                signedData: SIGNED_XDR,
                signerAddress: TEST_SIGNER_ADDRESS,
            }),
        );

        it("returns a transaction", async () => {
            const transaction = await signTransaction(INITIAL_XDR);
            expect(transaction).toBe(SIGNED_XDR);
        });
        it("called with xdr, connectionKey and signType", () => {
            // no network: a one-argument call is a Stellar call, permanently
            expect(requests.sign).toBeCalledWith(
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
            jest.spyOn(requests, "sign", null).mockImplementation(() => {
                throw TEST_ERROR;
            });
            // the transport already shaped the rejection; this layer must not re-wrap it
            await expect(signTransaction("unsigned")).rejects.toBe(TEST_ERROR);
        });
    });
});
