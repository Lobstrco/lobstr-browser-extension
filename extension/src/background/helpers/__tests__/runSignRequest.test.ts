import { runSignRequest } from "../runSignRequest";
import { signWithLobstr } from "@shared/api/lobstr-api";
import { findAccount, getAllAccounts, saveAllAccounts } from "../account";
import { AsyncOperation } from "../asyncOperations";
import { ERROR_MESSAGES } from "@shared/constants/errorMessages";
import {
    RequestSignAdditional,
    SignRequestResolve,
} from "@shared/constants/mesagesData.types";
import { Account } from "@shared/constants/types";

jest.mock("@shared/api/lobstr-api", () => ({ signWithLobstr: jest.fn() }));
jest.mock("../account", () => ({
    findAccount: jest.fn(),
    getAllAccounts: jest.fn(),
    saveAllAccounts: jest.fn(),
}));

const mockedSign = signWithLobstr as jest.Mock;
const mockedFindAccount = findAccount as jest.Mock;
const mockedGetAllAccounts = getAllAccounts as jest.Mock;
const mockedSaveAllAccounts = saveAllAccounts as jest.Mock;

const storedAccount = {
    publicKey: "GABC",
    connectionKey: "wallet-a",
    federation: "",
    nickname: "",
    userAgent: "iOS",
    lastActivityTime: 1,
    currency: "USD",
} as unknown as Account;

// a second wallet, so "update the one that signed" is distinguishable from "update all"
const otherAccount = {
    ...storedAccount,
    publicKey: "GXYZ",
    connectionKey: "wallet-b",
    lastActivityTime: 2,
} as unknown as Account;

const signRequest = (withData = true) => {
    const operation = new AsyncOperation<
        SignRequestResolve,
        RequestSignAdditional
    >();
    if (withData) {
        operation.setAdditionalData({
            dataToSign: "xdr",
            connectionKey: "wallet-a",
            domain: "example.com",
            signType: "transaction",
        });
    }
    operation.promise.catch(() => undefined);
    return operation;
};

beforeEach(() => {
    jest.resetAllMocks();
    mockedSign.mockResolvedValue("signed-xdr");
    mockedFindAccount.mockResolvedValue(storedAccount);
    mockedGetAllAccounts.mockResolvedValue([storedAccount, otherAccount]);
    mockedSaveAllAccounts.mockResolvedValue(undefined);
});

describe("runSignRequest", () => {
    it("resolves with the signature and the signer address", async () => {
        const operation = signRequest();

        await runSignRequest(operation);

        await expect(operation.promise).resolves.toEqual({
            signedData: "signed-xdr",
            signerAddress: "GABC",
        });
    });

    it("hands the signing the operation's own cancel signal", async () => {
        // this is what lets closing the prompt stop the polling
        const operation = signRequest();

        await runSignRequest(operation);

        expect(mockedSign).toHaveBeenCalledWith(
            "xdr",
            "wallet-a",
            "example.com",
            "transaction",
            operation.signal,
        );
    });

    it("still returns the signature when the signer can no longer be read", async () => {
        // the signature is the thing the user waited for; do not discard it
        mockedFindAccount
            .mockResolvedValueOnce(storedAccount)
            .mockResolvedValueOnce(undefined);
        const operation = signRequest();

        await runSignRequest(operation);

        await expect(operation.promise).resolves.toEqual({
            signedData: "signed-xdr",
            signerAddress: "",
        });
    });

    it("reports a signing failure without leaking its detail", async () => {
        mockedSign.mockRejectedValue(new Error("500: Internal Server Error"));
        const operation = signRequest();

        await runSignRequest(operation);

        await expect(operation.promise).rejects.toMatchObject({
            error: ERROR_MESSAGES.SIGN_FAILED,
        });
    });

    it("passes a reason we wrote ourselves straight through", async () => {
        mockedSign.mockRejectedValue(ERROR_MESSAGES.USER_DECLINED_ACCESS);
        const operation = signRequest();

        await runSignRequest(operation);

        await expect(operation.promise).rejects.toMatchObject({
            error: ERROR_MESSAGES.USER_DECLINED_ACCESS,
        });
    });

    it("records the wallet's activity before asking for a signature", async () => {
        const operation = signRequest();

        await runSignRequest(operation);

        expect(mockedSaveAllAccounts).toHaveBeenCalledTimes(1);
        // the wallet must be stamped before the request reaches it, not after
        expect(mockedSaveAllAccounts.mock.invocationCallOrder[0]).toBeLessThan(
            mockedSign.mock.invocationCallOrder[0],
        );
    });

    it("stamps only the wallet that is signing", async () => {
        const operation = signRequest();

        await runSignRequest(operation);

        const [signing, untouched] = mockedSaveAllAccounts.mock.calls[0][0];
        expect(signing.lastActivityTime).toBeGreaterThan(
            storedAccount.lastActivityTime,
        );
        expect(untouched).toEqual(otherAccount);
    });

    it("signs anyway when the activity time cannot be recorded", async () => {
        mockedSaveAllAccounts.mockRejectedValue(new Error("storage is full"));
        const operation = signRequest();

        await runSignRequest(operation);

        await expect(operation.promise).resolves.toMatchObject({
            signedData: "signed-xdr",
        });
    });

    it("declines a request whose wallet is no longer connected", async () => {
        mockedFindAccount.mockResolvedValue(undefined);
        const operation = signRequest();

        await runSignRequest(operation);

        await expect(operation.promise).rejects.toMatchObject({
            error: ERROR_MESSAGES.ACCOUNT_NOT_FOUND,
        });
        expect(mockedSign).not.toHaveBeenCalled();
    });

    it("answers instead of throwing when the request carries no data", async () => {
        const logged = jest.spyOn(console, "error").mockImplementation();
        const operation = signRequest(false);

        await runSignRequest(operation);

        await expect(operation.promise).rejects.toMatchObject({
            error: ERROR_MESSAGES.SIGN_FAILED,
        });
        expect(mockedSign).not.toHaveBeenCalled();
        // without the guard the destructuring throws and lands in the catch
        expect(logged).not.toHaveBeenCalled();
        logged.mockRestore();
    });
});
