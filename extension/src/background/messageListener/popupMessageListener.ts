import { Store } from "redux";
import { v4 as uuidv4 } from "uuid";

import { SERVICE_TYPES } from "@shared/constants/services";
import { Account, Request } from "@shared/constants/types";
import {
  checkLogin,
  signWithLobstr,
  logoutFromLobstr,
  checkConnection,
} from "@shared/api/lobstr-api";
import { getPunycodedDomain, getUrlHostname } from "../../helpers/urls";
import { getAllAccounts, getApplicationId } from "../helpers/account";
import { MessageResponder } from "background/types";

import {
  ALLOWLIST_ID,
  ALL_ACCOUNTS,
  APP_ID,
} from "constants/localStorageTypes";

import {
  browserLocalStorage,
  dataStorageAccess,
} from "background/helpers/dataStorage";

import {
  allAccountsSelector,
  applicationIdSelector,
  isStorageCheckedSelector,
  logIn,
  logOut,
  loadSavedState,
  setStorageChecked,
} from "background/ducks/session";

export const responseQueue: Array<(message?: any) => void> = [];
export const transactionQueue: Array<{
  connectionKey: string;
  transactionXdr: string;
  domain: string;
}> = [];

export const popupMessageListener = (request: Request, sessionStore: Store) => {
  const localStore = dataStorageAccess(browserLocalStorage);

  const grantAccess = async () => {
    const { url = "", publicKey = "", connectionKey = "" } = request;
    const sanitizedUrl = getUrlHostname(url);
    const punycodedDomain = getPunycodedDomain(sanitizedUrl);

    // TODO: right now we're just grabbing the last thing in the queue, but this should be smarter.
    // Maybe we need to search through responses to find a matching response :thinking_face
    const response = responseQueue.pop();
    const allowListStr = (await localStore.getItem(ALLOWLIST_ID)) || "";
    const allowList = allowListStr.split(",");
    allowList.push(punycodedDomain);

    await localStore.setItem(ALLOWLIST_ID, allowList.join());

    if (typeof response === "function") {
      return response({ url, publicKey, connectionKey });
    }

    return { error: "Access was denied" };
  };

  const rejectAccess = () => {
    const response = responseQueue.pop();
    if (response) {
      response();
    }
  };

  const _filterInactiveConnections = (
    connections: Account[],
  ): Promise<Account[]> =>
    Promise.all(
      connections.map(({ connectionKey }) => checkConnection(connectionKey)),
    ).then((res) =>
      res.reduce((acc, item, index) => {
        if (item) {
          acc.push(connections[index]);
        }
        return acc;
      }, [] as Account[]),
    );

  const _updateLastActivityTime = async (
    connectionKey: string,
  ): Promise<void> => {
    const currentState = sessionStore.getState();
    const allAccounts = allAccountsSelector(currentState);
    const allAccountsCopy = [...allAccounts];

    const activeAccountIndex = allAccounts.findIndex(
      ({ connectionKey: key }) => key === connectionKey,
    );

    if (activeAccountIndex === -1) {
      return;
    }
    allAccountsCopy[activeAccountIndex] = {
      ...allAccountsCopy[activeAccountIndex],
      ...{ lastActivityTime: Date.now() },
    };
    sessionStore.dispatch(logIn({ allAccounts: allAccountsCopy }));
    await localStore.setItem(ALL_ACCOUNTS, JSON.stringify(allAccountsCopy));
  };

  const loadState = async () => {
    const currentState = sessionStore.getState();

    if (isStorageCheckedSelector(currentState)) {
      const allAccounts = await _filterInactiveConnections(
        allAccountsSelector(currentState),
      );
      const applicationId = applicationIdSelector(currentState);
      await localStore.setItem(ALL_ACCOUNTS, JSON.stringify(allAccounts));
      sessionStore.dispatch(loadSavedState({ allAccounts, applicationId }));

      return {
        allAccounts,
        applicationId,
      };
    }

    const allAccounts: Account[] = await getAllAccounts();
    const filteredAccounts = await _filterInactiveConnections(allAccounts);
    await localStore.setItem(ALL_ACCOUNTS, JSON.stringify(filteredAccounts));

    let applicationId: string = await getApplicationId();

    if (!applicationId) {
      applicationId = uuidv4();
      await localStore.setItem(APP_ID, applicationId);
    }

    sessionStore.dispatch(
      loadSavedState({ allAccounts: filteredAccounts, applicationId }),
    );
    sessionStore.dispatch(setStorageChecked());

    return {
      allAccounts: filteredAccounts,
      applicationId,
    };
  };

  const login = async () => {
    const { uuid } = request;

    try {
      const {
        publicKey,
        federation,
        connectionKey,
        userAgent,
        lastActivityTime,
      } = await checkLogin(uuid);

      const allAccounts = allAccountsSelector(sessionStore.getState());

      const updatedAccounts = [
        ...allAccounts,
        { publicKey, federation, connectionKey, userAgent, lastActivityTime },
      ];

      if (allAccounts.find(({ connectionKey: key }) => key === connectionKey)) {
        return { error: `${connectionKey} is already exists` };
      }

      sessionStore.dispatch(logIn({ allAccounts: updatedAccounts }));

      await localStore.setItem(ALL_ACCOUNTS, JSON.stringify(updatedAccounts));

      return {
        allAccounts: updatedAccounts,
      };
    } catch (e) {
      return { error: e };
    }
  };

  const logout = async () => {
    const { connectionKey } = request;

    const allAccounts = allAccountsSelector(sessionStore.getState());

    await logoutFromLobstr(connectionKey);

    const updatedAccounts = allAccounts.filter(
      ({ connectionKey: key }) => key !== connectionKey,
    );

    sessionStore.dispatch(logOut({ allAccounts: updatedAccounts }));

    await localStore.setItem(ALL_ACCOUNTS, JSON.stringify(updatedAccounts));

    return {
      allAccounts: updatedAccounts,
    };
  };

  const signTransaction = async () => {
    const { transactionXdr, connectionKey, domain } =
      transactionQueue.pop() as {
        connectionKey: string;
        transactionXdr: string;
        domain: string;
      };

    if (!transactionXdr) {
      return { error: "transactionXDR is not exists" };
    }

    await _updateLastActivityTime(connectionKey);

    const transactionResponse = responseQueue.pop();

    try {
      const signedTx = await signWithLobstr(
        transactionXdr,
        connectionKey,
        domain,
      );
      if (typeof transactionResponse === "function") {
        return transactionResponse(signedTx);
      }
    } catch (e) {
      if (typeof transactionResponse === "function") {
        return { error: "Sign failed" };
      }
      return { error: e };
    }
  };

  const rejectTransaction = () => {
    transactionQueue.pop();
    const transactionResponse = responseQueue.pop();
    if (transactionResponse) {
      transactionResponse({ error: "Associated account not found" });
    }
  };

  const messageResponder: MessageResponder = {
    [SERVICE_TYPES.LOAD_STATE]: loadState,
    [SERVICE_TYPES.LOGIN]: login,
    [SERVICE_TYPES.LOGOUT]: logout,
    [SERVICE_TYPES.SIGN_TRANSACTION]: signTransaction,
    [SERVICE_TYPES.REJECT_TRANSACTION]: rejectTransaction,
    [SERVICE_TYPES.GRANT_ACCESS]: grantAccess,
    [SERVICE_TYPES.REJECT_ACCESS]: rejectAccess,
  };

  return messageResponder[request.type]();
};
