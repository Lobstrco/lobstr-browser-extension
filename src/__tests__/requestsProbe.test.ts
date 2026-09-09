import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    requestSupportedNetworks,
    sign,
    requestPublicKey,
} from "../internal/requests";
import { sendMessageToContentScript } from "../internal/transport";
import { EXTERNAL_SERVICE_TYPES } from "../protocol/messages";
import { API_VERSION } from "../protocol/api-version";
import { NETWORK } from "../networks";

vi.mock("../internal/transport", () => ({
    sendMessageToContentScript: vi.fn(),
}));

const mockedSend = vi.mocked(sendMessageToContentScript);

const sentMessage = () => mockedSend.mock.calls[0][0];

beforeEach(() => vi.resetAllMocks());

describe("network threading of the requests to the extension", () => {
    it.each([
        ["requestPublicKey", requestPublicKey],
        ["sign", (network: any) => sign("xdr", "key", "transaction", network)],
    ])(
        "sends an empty network as a network, not as none: %s",
        async (_label, call) => {
            // "" compiles against the open `NetworkId`, and absent means Stellar
            mockedSend.mockResolvedValue({
                publicKey: "G",
                connectionKey: "k",
            });

            await (call as any)("");

            expect(sentMessage()).toMatchObject({
                network: "",
                version: API_VERSION.V3,
            });
        },
    );

    it("sends no network field at all when the caller named none", async () => {
        // an extension that predates networks must see the message it knows
        mockedSend.mockResolvedValue({
            signedData: "signed",
            signerAddress: "G",
        });

        await sign("xdr", "wallet-a", "transaction");

        expect(sentMessage()).toEqual({
            dataToSign: "xdr",
            connectionKey: "wallet-a",
            signType: "transaction",
            type: EXTERNAL_SERVICE_TYPES.SIGN,
            version: API_VERSION.V2,
        });
    });

    it("marks a request that names a network as V3", async () => {
        mockedSend.mockResolvedValue({
            signedData: "signed",
            signerAddress: "r",
        });

        await sign("{}", "wallet-a", "transaction", NETWORK.ripple);

        expect(sentMessage()).toMatchObject({
            network: NETWORK.ripple,
            version: API_VERSION.V3,
        });
    });

    it("asks for access without a network when none was requested", async () => {
        mockedSend.mockResolvedValue({
            publicKey: "GABC",
            connectionKey: "wallet-a",
        });

        await expect(requestPublicKey()).resolves.toEqual({
            publicKey: "GABC",
            connectionKey: "wallet-a",
            network: NETWORK.stellar,
        });
        expect(sentMessage()).toEqual({
            type: EXTERNAL_SERVICE_TYPES.REQUEST_ACCESS,
            version: API_VERSION.V2,
        });
    });

    it("returns the network the extension granted", async () => {
        mockedSend.mockResolvedValue({
            publicKey: "rABC",
            connectionKey: "wallet-r",
            network: "ripple",
        });

        await expect(requestPublicKey(NETWORK.ripple)).resolves.toMatchObject({
            network: "ripple",
        });
    });

    it("reads a silent extension as Stellar-only", async () => {
        // the transport resolves the probe with { networks: null } on timeout
        mockedSend.mockResolvedValue({ networks: null });

        const networks = await requestSupportedNetworks();

        expect(networks).toHaveLength(1);
        expect(networks[0]).toMatchObject({
            network: NETWORK.stellar,
            signTypes: ["transaction", "message"],
        });
    });

    it("reports every network the extension lists", async () => {
        mockedSend.mockResolvedValue({
            networks: [
                { network: NETWORK.stellar },
                { network: NETWORK.ripple },
            ],
        });

        await expect(requestSupportedNetworks()).resolves.toHaveLength(2);
    });

    it("hands the page only the connection fields it is meant to see", async () => {
        // crosses into an untrusted page: a later field must not leak by default
        mockedSend.mockResolvedValue({
            source: "LOBSTR_EXTERNAL_MSG_RESPONSE",
            messagedId: 42,
            publicKey: "rAnchor",
            connectionKey: "wallet-xrpl",
            network: "ripple",
            federation: "someone*lobstr.co",
            nickname: "Savings",
            userAgent: "iPhone; iOS 18",
        });

        const connection = await requestPublicKey(NETWORK.ripple);

        expect(connection).toEqual({
            publicKey: "rAnchor",
            connectionKey: "wallet-xrpl",
            network: "ripple",
        });
    });
});
