import * as apiExternal from "@shared/api/external";
import { signTransaction } from "../signTransaction";
import { getPublicKey } from "../getPublicKey";

describe("signTransaction", () => {
  describe("success case", () => {
    const INITIAL_XDR = "unsigned";
    const SIGNED_XDR = "signed";
    const TEST_CONNECTION_KEY = "xxxx-xxxx-xxxx";
    const TEST_SIGNER_ADDRESS = "GXXXXXXX....XXXXXXX";

    // call getPublicKey to test saving connectionKey
    jest.spyOn(apiExternal, "requestPublicKey", null).mockReturnValue({
      connectionKey: TEST_CONNECTION_KEY,
    });
    getPublicKey();

    jest.spyOn(apiExternal, "sign", null).mockReturnValue(
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
      expect(apiExternal.sign).toBeCalledWith(
        INITIAL_XDR,
        TEST_CONNECTION_KEY,
        "transaction",
      );
    });
  });

  describe("fail case", () => {
    it("rejects with a bare string", async () => {
      const TEST_ERROR = "Error!";
      jest.spyOn(apiExternal, "sign", null).mockImplementation(() => {
        throw TEST_ERROR;
      });
      // the published contract is a bare string rejection, not an Error
      await expect(signTransaction("unsigned")).rejects.toBe(TEST_ERROR);
    });
  });
});
