import { Store } from "redux";
import { v4 as uuidv4 } from "uuid";

import { SERVICE_TYPES } from "@shared/constants/services";
import { Account, Request } from "@shared/constants/types";
import {
  checkLogin,
  getLastLumenQuotes,
  logoutFromLobstr,
  signWithLobstr,
  updateConnection,
} from "@shared/api/lobstr-api";
import { getAssetsInfo } from "@shared/api/internal";
import {
  getAllAccounts,
  getApplicationId,
  getAssetsCached,
  getIsHiddenMode,
  getSelectedConnection,
  saveAllAccounts,
  saveApplicationId,
  saveAssetsCached,
  saveIsHiddenMode,
  saveSelectedConnection,
} from "../helpers/account";
import { getAssetString } from "../helpers/stellar";
import { AllowedSenders } from "../helpers/allowListAuthorization";
import { MessageResponder } from "background/types";

import {
  allAccountsSelector,
  applicationIdSelector,
  isHiddenModeSelector,
  isStorageCheckedSelector,
  loadSavedState,
  logIn,
  logOut,
  selectConnection,
  selectedConnectionSelector,
  setStorageChecked,
  toggleHiddenMode,
} from "background/ducks/session";

export const responseQueue: Array<(message?: any) => void> = [];
export const transactionQueue: Array<{
  connectionKey: string;
  transactionXdr: string;
  domain: string;
}> = [];

export const popupMessageListener = (request: Request, sessionStore: Store) => {
  const grantAccess = async () => {
    const { url = "", publicKey = "", connectionKey = "" } = request;
    await AllowedSenders.addToList(url);

    // TODO: right now we're just grabbing the last thing in the queue, but this should be smarter.
    // Maybe we need to search through responses to find a matching response :thinking_face
    const response = responseQueue.pop();

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

  const _updateConnections = (connections: Account[]): Promise<Account[]> =>
    Promise.all(
      connections.map(({ connectionKey }) => updateConnection(connectionKey)),
    ).then((res) =>
      res.reduce((acc, item, index) => {
        if (item) {
          acc.push({
            ...item,
            lastActivityTime: connections[index].lastActivityTime,
          } as Account);
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
    await saveAllAccounts(allAccountsCopy);
  };

  const _updateSelectedConnection = async (
    allAccounts: Account[],
    currentConnection: string,
  ): Promise<string> => {
    if (!allAccounts.length) {
      await saveSelectedConnection("");
      sessionStore.dispatch(selectConnection({ selectedConnection: "" }));
      return "";
    }
    if (allAccounts.find((a) => a.connectionKey === currentConnection)) {
      await saveSelectedConnection(currentConnection);
      sessionStore.dispatch(
        selectConnection({ selectedConnection: currentConnection }),
      );
      return currentConnection;
    }

    const newConnection = allAccounts.sort(
      (a, b) => b.lastActivityTime - a.lastActivityTime,
    )[0].connectionKey;

    sessionStore.dispatch(
      selectConnection({ selectedConnection: newConnection }),
    );
    await saveSelectedConnection(newConnection);

    return newConnection;
  };

  const loadState = async () => {
    const currentState = sessionStore.getState();

    if (isStorageCheckedSelector(currentState)) {
      const allAccounts = await _updateConnections(
        allAccountsSelector(currentState),
      );
      const applicationId = applicationIdSelector(currentState);
      await saveAllAccounts(allAccounts);
      const isHiddenMode = isHiddenModeSelector(currentState);
      const savedConnection = selectedConnectionSelector(currentState);

      const selectedConnection = await _updateSelectedConnection(
        allAccounts,
        savedConnection,
      );

      sessionStore.dispatch(
        loadSavedState({
          allAccounts,
          applicationId,
          isHiddenMode,
          selectedConnection,
        }),
      );

      return {
        allAccounts,
        applicationId,
        isHiddenMode,
        selectedConnection,
      };
    }

    const allAccounts: Account[] = await getAllAccounts();
    const filteredAccounts = await _updateConnections(allAccounts);
    await saveAllAccounts(filteredAccounts);

    let applicationId: string = await getApplicationId();

    if (!applicationId) {
      applicationId = uuidv4();
      await saveApplicationId(applicationId);
    }

    const isHiddenMode = await getIsHiddenMode();
    const savedConnection = await getSelectedConnection();

    const selectedConnection = await _updateSelectedConnection(
      filteredAccounts,
      savedConnection,
    );

    sessionStore.dispatch(
      loadSavedState({
        allAccounts: filteredAccounts,
        applicationId,
        isHiddenMode,
        selectedConnection,
      }),
    );
    sessionStore.dispatch(setStorageChecked());

    return {
      allAccounts: filteredAccounts,
      applicationId,
      selectedConnection,
      isHiddenMode,
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
        currency,
      } = await checkLogin(uuid);

      const allAccounts = allAccountsSelector(sessionStore.getState());

      const filteredAccounts = await _updateConnections(allAccounts);

      const updatedAccounts = [
        ...filteredAccounts,
        {
          publicKey,
          federation,
          connectionKey,
          userAgent,
          lastActivityTime,
          currency,
        },
      ];

      if (allAccounts.find(({ connectionKey: key }) => key === connectionKey)) {
        return { error: `${connectionKey} is already exists` };
      }

      // Update selected account to a new account
      const selectedConnection = await _updateSelectedConnection(
        updatedAccounts,
        connectionKey,
      );

      sessionStore.dispatch(logIn({ allAccounts: updatedAccounts }));

      await saveAllAccounts(updatedAccounts);

      return {
        allAccounts: updatedAccounts,
        selectedConnection,
      };
    } catch (e) {
      return { error: e };
    }
  };

  const selectNewConnection = async () => {
    const { connectionKey } = request;

    const allAccounts = allAccountsSelector(sessionStore.getState());

    const selectedConnection = await _updateSelectedConnection(
      allAccounts,
      connectionKey,
    );

    return {
      selectedConnection,
    };
  };

  const logout = async () => {
    const { connectionKey } = request;

    const allAccounts = allAccountsSelector(sessionStore.getState());

    await logoutFromLobstr(connectionKey);

    const updatedAccounts = allAccounts.filter(
      ({ connectionKey: key }) => key !== connectionKey,
    );

    const savedConnection = selectedConnectionSelector(sessionStore.getState());
    const selectedConnection = await _updateSelectedConnection(
      updatedAccounts,
      savedConnection,
    );

    sessionStore.dispatch(logOut({ allAccounts: updatedAccounts }));

    await saveAllAccounts(updatedAccounts);

    return {
      allAccounts: updatedAccounts,
      selectedConnection,
    };
  };

  const toggleAppHiddenMode = async () => {
    const newState = !isHiddenModeSelector(sessionStore.getState());
    await saveIsHiddenMode(newState);
    sessionStore.dispatch(toggleHiddenMode());

    return {
      isHiddenMode: newState,
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

  const loadCachedAssets = async () => {
    const assets = await getAssetsCached();

    return { assets };
  };

  const processNewAssets = async () => {
    const { assets } = request;

    const cached = await getAssetsCached();

    const cachedMap = cached.reduce((acc, asset) => {
      acc.set(getAssetString(asset), asset);
      return acc;
    }, new Map());

    if (!cachedMap.has("XLM:undefined")) {
      cachedMap.set("XLM:undefined", {
        code: "XLM",
        issuer: undefined,
        name: "Lumens",
        image:
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMjUgMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xOS43OTczIDUuNTQyNDlMMTcuMzk1NiA2Ljc2NjEyTDUuNzk4MTUgMTIuNjczM0M1Ljc1ODkzIDEyLjM3NDIgNS43MzkyIDEyLjA3MjggNS43MzkwOCAxMS43NzEyQzUuNzQyMyA5LjMyMjA5IDcuMDQxODYgNy4wNTc3NSA5LjE1NDg3IDUuODE5NTFDMTEuMjY3OSA0LjU4MTI3IDEzLjg3ODUgNC41NTQyMSAxNi4wMTY3IDUuNzQ4MzlMMTcuMzkxNCA1LjA0Nzk3TDE3LjU5NjUgNC45NDMzM0MxNS4wMjg4IDMuMDc5NjUgMTEuNjMyNyAyLjgxMzY5IDguODA2MTggNC4yNTQ5MUM1Ljk3OTY1IDUuNjk2MTMgNC4yMDAzNSA4LjYwMDk1IDQuMjAwNjggMTEuNzczN0M0LjIwMDY4IDExLjk4ODYgNC4yMDg4NCAxMi4yMDI3IDQuMjI1MTUgMTIuNDE1OUM0LjI3MTg4IDEzLjAzMzMgMy45NDMwOSAxMy42MTgzIDMuMzkxNCAxMy44OTk0TDIuNjY2NSAxNC4yNjkxVjE1Ljk5MzFMNC44MDA2OCAxNC45MDU0TDUuNDkxODIgMTQuNTUyNkw2LjE3MjgzIDE0LjIwNThMMTguMzk5IDcuOTc2MjRMMTkuNzcyOCA3LjI3NjY2TDIyLjYxMjUgNS44Mjk0MVY0LjEwNjJMMTkuNzk3MyA1LjU0MjQ5WiIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTIyLjYxMjUgNy41NTQ2OUw2Ljg2NzM1IDE1LjU3MTZMNS40OTM1MSAxNi4yNzI4TDIuNjY2NSAxNy43MTMzVjE5LjQzNTdMNS40NzQxIDE4LjAwNTNMNy44NzU3OSAxNi43ODE3TDE5LjQ4NTEgMTAuODY2MUMxOS41MjQzIDExLjE2NzIgMTkuNTQ0IDExLjQ3MDUgMTkuNTQ0MSAxMS43NzQxQzE5LjU0MjYgMTQuMjI2MSAxOC4yNDE2IDE2LjQ5MzYgMTYuMTI1NCAxNy43MzIzQzE0LjAwOTMgMTguOTcxIDExLjM5NTEgMTguOTk1MiA5LjI1NjM4IDE3Ljc5Nkw5LjE3MTk5IDE3Ljg0MDhMNy42ODE2OSAxOC42MDAzQzEwLjI0ODggMjAuNDY0IDEzLjY0NDIgMjAuNzMwNiAxNi40NzA3IDE5LjI5MDNDMTkuMjk3MyAxNy44NTAxIDIxLjA3NzMgMTQuOTQ2NCAyMS4wNzgzIDExLjc3NDFDMjEuMDc4MyAxMS41NTcyIDIxLjA2OTkgMTEuMzQwMyAyMS4wNTM4IDExLjEyNkMyMS4wMDcyIDEwLjUwODggMjEuMzM1NiA5LjkyMzk3IDIxLjg4NjggOS42NDI0NUwyMi42MTI1IDkuMjcyODNWNy41NTQ2OVoiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo=",
        asset_string: "XLM:native",
        home_domain: "stellar.org",
        desc: "Lumens are the native digital currency of the Stellar Network built to act as a medium of exchange between other assets.",
      });
    }

    const newAssets = assets.filter(
      (asset) => !cachedMap.has(getAssetString(asset)),
    );

    if (!newAssets.length) {
      return { assets: [...cachedMap.values()] };
    }

    const result = await getAssetsInfo(newAssets);

    result.forEach((info) => {
      cachedMap.set(getAssetString(info), info);
    });

    const allAssets = [...cachedMap.values()];

    await saveAssetsCached(allAssets);

    return { assets: allAssets };
  };

  const getLumenQuotes = async () => {
    const quotes = await getLastLumenQuotes();

    return { quotes };
  };

  const messageResponder: MessageResponder = {
    [SERVICE_TYPES.LOAD_STATE]: loadState,
    [SERVICE_TYPES.LOGIN]: login,
    [SERVICE_TYPES.LOGOUT]: logout,
    [SERVICE_TYPES.SIGN_TRANSACTION]: signTransaction,
    [SERVICE_TYPES.REJECT_TRANSACTION]: rejectTransaction,
    [SERVICE_TYPES.GRANT_ACCESS]: grantAccess,
    [SERVICE_TYPES.REJECT_ACCESS]: rejectAccess,
    [SERVICE_TYPES.SELECT_CONNECTION]: selectNewConnection,
    [SERVICE_TYPES.TOGGLE_HIDDEN_MODE]: toggleAppHiddenMode,
    [SERVICE_TYPES.LOAD_CACHED_ASSETS]: loadCachedAssets,
    [SERVICE_TYPES.PROCESS_NEW_ASSETS]: processNewAssets,
    [SERVICE_TYPES.GET_LUMEN_QUOTES]: getLumenQuotes,
  };

  return messageResponder[request.type]();
};
