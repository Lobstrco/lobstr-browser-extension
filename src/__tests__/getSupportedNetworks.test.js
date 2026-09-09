import * as requests from "../internal/requests";
import { getSupportedNetworks, supportsNetwork } from "../getSupportedNetworks";
import { NETWORK } from "../networks";

describe("getSupportedNetworks", () => {
    afterEach(() => jest.restoreAllMocks());

    it("reports what the extension answers", async () => {
        jest.spyOn(
            requests,
            "requestSupportedNetworks",
            null,
        ).mockResolvedValue([
            { network: NETWORK.stellar, signTypes: ["transaction", "message"] },
            { network: NETWORK.ripple, signTypes: ["transaction"] },
        ]);

        await expect(getSupportedNetworks()).resolves.toHaveLength(2);
        await expect(supportsNetwork(NETWORK.ripple)).resolves.toBe(true);
    });

    it("reads an extension that never answers as Stellar-only", async () => {
        // an older build never replies; the transport turns silence into Stellar-only
        jest.spyOn(
            requests,
            "requestSupportedNetworks",
            null,
        ).mockResolvedValue([
            { network: NETWORK.stellar, signTypes: ["transaction", "message"] },
        ]);

        await expect(supportsNetwork(NETWORK.ripple)).resolves.toBe(false);
        await expect(supportsNetwork(NETWORK.stellar)).resolves.toBe(true);
    });
});
