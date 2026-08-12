import { AsyncOperationsStore } from "../../../helpers/asyncOperations";
import { rejectSigning } from "../rejectSigning";
import { ERROR_MESSAGES } from "@shared/constants/errorMessages";
import {
    RequestSignAdditional,
    SignRequestResolve,
} from "@shared/constants/mesagesData.types";

const additionalData = (connectionKey: string): RequestSignAdditional => ({
    dataToSign: "xdr",
    connectionKey,
    domain: "example.com",
    signType: "transaction",
});

const createOperation = (connectionKey: string) =>
    AsyncOperationsStore.create<
        SignRequestResolve,
        RequestSignAdditional
    >().setAdditionalData(additionalData(connectionKey));

describe("rejectSigning", () => {
    it("rejects the operation it was addressed to", async () => {
        const operation = createOperation("wallet-a");

        rejectSigning({ operationId: operation.id, connectionKey: "wallet-a" });

        await expect(operation.promise).rejects.toMatchObject({
            error: ERROR_MESSAGES.ACCOUNT_NOT_FOUND,
        });
    });

    it("leaves an operation belonging to another connection alone", () => {
        // models a popup that outlived a worker restart and reused an id
        const operation = createOperation("wallet-a");
        const settled = jest.fn();
        operation.onSettled(settled);
        // a regression here would settle the operation; keep that from crashing the run
        operation.promise.catch(() => undefined);

        rejectSigning({ operationId: operation.id, connectionKey: "wallet-b" });

        expect(settled).not.toHaveBeenCalled();
    });

    it("does nothing when the operation is already gone", () => {
        expect(() =>
            rejectSigning({
                operationId: "no-such-operation",
                connectionKey: "wallet-a",
            }),
        ).not.toThrow();
    });
});
