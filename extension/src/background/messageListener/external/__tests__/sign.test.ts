import { sign } from "../sign";
import { queueSignRequest } from "../../../helpers/signPrompt";
import { AllowedSenders } from "../../../helpers/allowListAuthorization";
import { ERROR_MESSAGES } from "@shared/constants/errorMessages";
import { API_VERSION } from "@shared/constants/api-version";
import { EXTERNAL_SERVICE_TYPES } from "@shared/constants/services";
import { ExternalRequestTxV2 } from "@shared/constants/types";

jest.mock("../../../helpers/signPrompt", () => ({ queueSignRequest: jest.fn() }));
jest.mock("../../../helpers/allowListAuthorization", () => ({
    AllowedSenders: { addToList: jest.fn() },
}));

const mockedQueue = queueSignRequest as jest.Mock;
const mockedAllowList = AllowedSenders.addToList as jest.Mock;

const request = (overrides: Partial<ExternalRequestTxV2>): ExternalRequestTxV2 =>
    ({
        type: EXTERNAL_SERVICE_TYPES.SIGN,
        version: API_VERSION.V2,
        dataToSign: "xdr",
        connectionKey: "wallet-a",
        signType: "transaction",
        ...overrides,
    } as ExternalRequestTxV2);

const sender = { url: "https://example.com" };

beforeEach(() => jest.resetAllMocks());

describe("external sign validation", () => {
    it("rejects an empty payload without registering it", async () => {
        await expect(
            sign(request({ dataToSign: "" }), sender),
        ).rejects.toMatchObject({ error: ERROR_MESSAGES.DATA_TO_SIGN_MISSING });
        expect(mockedQueue).not.toHaveBeenCalled();
    });

    it("rejects a missing connection key without registering it", async () => {
        await expect(
            sign(request({ connectionKey: "" }), sender),
        ).rejects.toMatchObject({
            error: ERROR_MESSAGES.CONNECTION_KEY_MISSING,
        });
        expect(mockedQueue).not.toHaveBeenCalled();
    });

    it("queues a valid request without waiting on anything", () => {
        // queuing must be synchronous or back-to-back requests reorder
        sign(request({}), sender).catch(() => undefined);

        expect(mockedQueue).toHaveBeenCalledTimes(1);
    });

    it("queues exactly what the page asked to sign", () => {
        sign(
            request({ dataToSign: "the-xdr", signType: "message" }),
            sender,
        ).catch(() => undefined);

        // the domain is what the wallet shows the user, so it must be the caller's
        expect(mockedQueue.mock.calls[0][0].getAdditionalData()).toEqual({
            dataToSign: "the-xdr",
            connectionKey: "wallet-a",
            domain: "example.com",
            signType: "message",
        });
    });

    it("allow-lists the site once its request is signed", async () => {
        const operation = sign(request({}), sender);
        const queued = mockedQueue.mock.calls[0][0];

        queued.resolve({ signedData: "signed", signerAddress: "G..." });
        await operation;

        expect(mockedAllowList).toHaveBeenCalledWith(sender.url);
    });
});
