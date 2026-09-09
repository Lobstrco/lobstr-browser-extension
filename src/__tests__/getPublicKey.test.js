import * as requests from "../internal/requests";
import { CONNECTION_STORAGE_KEY } from "../internal/connectionKey";
import { NETWORK } from "../networks";
import { getPublicKey } from "../getPublicKey";

describe("getPublicKey", () => {
    describe("success case", () => {
        const TEST_PUBLIC_KEY = "GXXXXXXX....XXXXXXX";
        const TEST_CONNECTION_KEY = "xxxxx-xxxxxx-xxxxxx";

        // `network` is resolved by the call being mocked here, so it is never absent
        jest.spyOn(requests, "requestPublicKey", null).mockReturnValue({
            publicKey: TEST_PUBLIC_KEY,
            connectionKey: TEST_CONNECTION_KEY,
            network: NETWORK.stellar,
        });
        it("returns a publicKey", async () => {
            const publicKey = await getPublicKey();
            expect(publicKey).toBe(TEST_PUBLIC_KEY);
        });
        it("saves a connectionKey", () => {
            const savedKey = sessionStorage.getItem(CONNECTION_STORAGE_KEY);

            expect(savedKey).toBe(TEST_CONNECTION_KEY);
        });
    });

    describe("fail case", () => {
        const TEST_ERROR = "Error!";

        it("throws an error", async () => {
            jest.spyOn(requests, "requestPublicKey", null).mockImplementation(
                () => {
                    throw TEST_ERROR;
                },
            );
            // `.rejects` must be awaited or the assertion never runs
            await expect(getPublicKey()).rejects.toBe(TEST_ERROR);
        });
    });
});
