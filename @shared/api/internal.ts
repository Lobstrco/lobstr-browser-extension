import { Account } from "@shared/constants/types";
import { APPLICATION_STATES } from "@shared/constants/applicationState";
import { SERVICE_TYPES } from "../constants/services";

import { sendMessageToBackground } from "./helpers/extensionMessaging";

export const loadState = (): Promise<{
  allAccounts: Account[];
  applicationState: APPLICATION_STATES;
  applicationId: string;
}> =>
  sendMessageToBackground({
    type: SERVICE_TYPES.LOAD_STATE,
  });

export const login = (
  uuid: string,
): Promise<{ allAccounts: Account[]; error: string }> =>
  sendMessageToBackground({
    uuid,
    type: SERVICE_TYPES.LOGIN,
  });

export const logout = (
  connectionKey: string,
): Promise<{ allAccounts: Account[] }> =>
  sendMessageToBackground({
    connectionKey,
    type: SERVICE_TYPES.LOGOUT,
  });

// ACCESS

export const rejectAccess = async (): Promise<void> => {
  try {
    await sendMessageToBackground({
      type: SERVICE_TYPES.REJECT_ACCESS,
    });
  } catch (e) {
    console.error(e);
  }
};

export const grantAccess = async ({
  url,
  publicKey,
  connectionKey,
}: {
  url: string;
  publicKey: string;
  connectionKey: string;
}): Promise<void> => {
  try {
    await sendMessageToBackground({
      url,
      publicKey,
      connectionKey,
      type: SERVICE_TYPES.GRANT_ACCESS,
    });
  } catch (e) {
    console.error(e);
  }
};

export const signTransaction = async (): Promise<void> => {
  try {
    await sendMessageToBackground({
      type: SERVICE_TYPES.SIGN_TRANSACTION,
    });
  } catch (e) {
    console.error(e);
  }
};

export const rejectTransaction = async (): Promise<void> => {
  try {
    await sendMessageToBackground({
      type: SERVICE_TYPES.REJECT_TRANSACTION,
    });
  } catch (e) {
    console.error(e);
  }
};
