import { GetPublicKeyResponse } from "@shared/constants/types";
import { EXTERNAL_SERVICE_TYPES } from "../constants/services";
import { sendMessageToContentScript } from "./helpers/extensionMessaging";

export const requestPublicKey = async (): Promise<GetPublicKeyResponse> => {
  let response = { publicKey: "", error: "", connectionKey: "" };
  try {
    response = await sendMessageToContentScript({
      type: EXTERNAL_SERVICE_TYPES.REQUEST_ACCESS,
    });
  } catch (e) {
    console.error(e);
  }

  const { publicKey, connectionKey, error } = response;

  if (error) {
    throw error;
  }
  return { publicKey, connectionKey };
};

export const signTransaction = async (
  transactionXdr: string,
  connectionKey: string,
): Promise<string> => {
  let response = { signedTransaction: "", error: "" };
  try {
    response = await sendMessageToContentScript({
      transactionXdr,
      connectionKey,
      type: EXTERNAL_SERVICE_TYPES.SIGN_TRANSACTION,
    });
  } catch (e) {
    console.error(e);
    throw e;
  }
  const { signedTransaction, error } = response;

  if (error) {
    throw error;
  }
  return signedTransaction;
};

export const requestConnectionStatus = async (): Promise<boolean> => {
  let response = {
    isConnected: false,
  };

  try {
    response = await sendMessageToContentScript({
      type: EXTERNAL_SERVICE_TYPES.REQUEST_CONNECTION_STATUS,
    });
  } catch (e) {
    console.error(e);
  }

  return response.isConnected;
};
