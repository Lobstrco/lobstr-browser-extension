import { sign } from "../sign";
import { PopupWindow } from "background/helpers/popupWindow";
import { ERROR_MESSAGES } from "@shared/constants/errorMessages";
import { API_VERSION } from "@shared/constants/api-version";
import { EXTERNAL_SERVICE_TYPES } from "@shared/constants/services";
import { ExternalRequestTxV2 } from "@shared/constants/types";

jest.mock("background/helpers/popupWindow", () => ({
    PopupWindow: jest.fn().mockImplementation(() => ({
        onUnableToOpen: jest.fn().mockReturnThis(),
        onRemoved: jest.fn().mockReturnThis(),
    })),
}));

jest.mock("../../../helpers/allowListAuthorization", () => ({
    AllowedSenders: { addToList: jest.fn() },
}));

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

beforeEach(() => jest.clearAllMocks());

describe("external sign validation", () => {
    it("rejects an empty payload without opening a window", async () => {
        const result = sign(request({ dataToSign: "" }), sender);

        await expect(result).rejects.toMatchObject({
            error: ERROR_MESSAGES.DATA_TO_SIGN_MISSING,
        });
        expect(PopupWindow).not.toHaveBeenCalled();
    });

    it("rejects a missing connection key without opening a window", async () => {
        const result = sign(request({ connectionKey: "" }), sender);

        await expect(result).rejects.toMatchObject({
            error: ERROR_MESSAGES.CONNECTION_KEY_MISSING,
        });
        expect(PopupWindow).not.toHaveBeenCalled();
    });

    it("opens the confirmation window for a valid request", () => {
        const result = sign(request({}), sender);
        result.catch(() => undefined);

        expect(PopupWindow).toHaveBeenCalledTimes(1);
    });
});
