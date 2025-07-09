import {
  Account,
  Asset,
  AssetSimple,
  LumenQuote,
  AlternativeRatesResponse,
  Response
} from "@shared/constants/types";
import { APPLICATION_STATES } from "@shared/constants/applicationState";
import { getAssetString } from "extension/src/background/helpers/stellar";
import { ASSETS_URL, ALTERNATIVE_PRICES_URL } from "@shared/constants/stellar";
import { SERVICE_TYPES } from "../constants/services";

import { sendMessageToBackground } from "./helpers/extensionMessaging";
import { get, post } from "./helpers/request";
import { GrantAccessData, RequestWithOperation } from "../constants/mesagesData.types";

export const loadState = (): Promise<{
  allAccounts: Account[];
  applicationState: APPLICATION_STATES;
  applicationId: string;
  selectedConnection: string;
  isHiddenMode: boolean;
}> =>
  sendMessageToBackground({
    type: SERVICE_TYPES.LOAD_STATE,
  });

export const login = (
  uuid: string,
): Promise<{
  allAccounts: Account[];
  error: string;
  selectedConnection: string;
}> =>
  sendMessageToBackground({
    uuid,
    type: SERVICE_TYPES.LOGIN,
  });

export const selectConnection = (
  connectionKey: string,
): Promise<{
  selectedConnection: string;
}> =>
  sendMessageToBackground({
    connectionKey,
    type: SERVICE_TYPES.SELECT_CONNECTION,
  });

export const toggleHiddenMode = (): Promise<{
  isHiddenMode: boolean;
}> =>
  sendMessageToBackground({
    type: SERVICE_TYPES.TOGGLE_HIDDEN_MODE,
  });

export const logout = (
  connectionKey: string,
): Promise<{ allAccounts: Account[]; selectedConnection: string }> =>
  sendMessageToBackground({
    connectionKey,
    type: SERVICE_TYPES.LOGOUT,
  });

export const cancelLoginPolling = (): Promise<Response> =>
  sendMessageToBackground({
    type: SERVICE_TYPES.CANCEL_LOGIN_POLLING,
  });

// ACCESS

export const rejectAccess = async (data: RequestWithOperation): Promise<void> => {
  try {
    await sendMessageToBackground({
      data,
      type: SERVICE_TYPES.REJECT_ACCESS,
    });
  } catch (e) {
    console.error(e);
  }
};

export const grantAccess = async (data: GrantAccessData): Promise<void> => {
  try {
    await sendMessageToBackground({
      data,
      type: SERVICE_TYPES.GRANT_ACCESS,
    });
  } catch (e) {
    console.error(e);
  }
};

export const signTransaction = async (data: RequestWithOperation): Promise<void> => {
  try {
    await sendMessageToBackground({
      data,
      type: SERVICE_TYPES.SIGN_TRANSACTION,
    });
  } catch (e) {
    console.error(e);
  }
};

export const rejectTransaction = async (data: RequestWithOperation): Promise<void> => {
  try {
    await sendMessageToBackground({
      data,
      type: SERVICE_TYPES.REJECT_TRANSACTION,
    });
  } catch (e) {
    console.error(e);
  }
};

export const loadCachedAssets = (): Promise<{
  assets: Asset[];
}> =>
  sendMessageToBackground({
    type: SERVICE_TYPES.LOAD_CACHED_ASSETS,
  });

export const processNewAssets = (
  assets: AssetSimple[],
): Promise<{
  assets: Asset[];
}> =>
  sendMessageToBackground({
    type: SERVICE_TYPES.PROCESS_NEW_ASSETS,
    assets,
  });

export const getAssetsInfo = (assets: AssetSimple[]): Promise<Asset[]> => {
  const params = new URLSearchParams();

  assets.forEach((asset) => {
    params.append("asset", `${asset.code}:${asset.issuer}`);
  });

  return get(`${ASSETS_URL}?${params.toString()}`).then((data) => data.results);
};

export const getPricesCollection = async (
    assets: AssetSimple[],
): Promise<Map<string, number>> => {
  const chunkSize: number = 100;

  // Split by chunks
  const assetChunks = [];
  for (let i = 0; i < assets.length; i += chunkSize) {
    const assetsChunk = assets.slice(i, i + chunkSize).map(({ code, issuer }) => ({ code, issuer }));
    assetChunks.push(assetsChunk);
  }
  // Request data
  const results = await Promise.all(assetChunks.map(fetchPricesChunk));

  // create collection 'code:issuer' -> price
  return results.flat().reduce((collection: Map<string, number>, data: AlternativeRatesResponse) => {
    const price: number | undefined = data.last_native_rate?.base_asset === 'native' ?
        data.last_native_rate?.reverse_rate :
        data.last_native_rate?.rate;
    collection.set(getAssetString(data), price || 0);
    return collection;
  }, new Map());
};
const fetchPricesChunk = async (chunk: AssetSimple[]): Promise<AlternativeRatesResponse[]> => {
  const body = JSON.stringify(chunk);
  return await post(ALTERNATIVE_PRICES_URL, { body });
};

export const getLumenQuotes = (): Promise<{ quotes: LumenQuote[] }> =>
  sendMessageToBackground({
    type: SERVICE_TYPES.GET_LUMEN_QUOTES,
  });
