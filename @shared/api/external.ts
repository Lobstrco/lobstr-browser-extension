import { GetPublicKeyResponse } from "@shared/constants/types";
import { API_VERSION } from "@shared/constants/api-version";
import { EXTERNAL_SERVICE_TYPES } from "../constants/services";
import { sendMessageToContentScript } from "./helpers/extensionMessaging";

export const requestPublicKey = async (): Promise<GetPublicKeyResponse> => {
    let response = { publicKey: "", error: "", connectionKey: "" };
    try {
        response = await sendMessageToContentScript({
            type: EXTERNAL_SERVICE_TYPES.REQUEST_ACCESS,
            version: API_VERSION.V2,
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

export const sign = async (
    dataToSign: string,
    connectionKey: string,
    signType: "transaction" | "message",
): Promise<{ signedData: string; signerAddress: string }> => {
    let response = { signedData: "", error: "", signerAddress: "" };
    try {
        response = await sendMessageToContentScript({
            dataToSign,
            connectionKey,
            signType,
            type: EXTERNAL_SERVICE_TYPES.SIGN,
            version: API_VERSION.V2,
        });
    } catch (e) {
        console.error(e);
        throw e;
    }
    if (response.error) {
        throw response.error;
    }
    return response;
};

export const requestConnectionStatus = async (): Promise<boolean> => {
    let response = {
        isConnected: false,
    };

    try {
        response = await sendMessageToContentScript({
            type: EXTERNAL_SERVICE_TYPES.REQUEST_CONNECTION_STATUS,
            version: API_VERSION.V2,
        });
    } catch (e) {
        console.error(e);
    }

    return response.isConnected;
};
