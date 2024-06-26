import { Account, Asset } from "@shared/constants/types";
import {
  ALL_ACCOUNTS,
  APP_ID,
  ASSETS_CACHE,
  IS_HIDDEN_MODE,
  SELECTED_CONNECTION,
} from "constants/localStorageTypes";
import {
  dataStorageAccess,
  browserLocalStorage,
} from "background/helpers/dataStorage";

const localStore = dataStorageAccess(browserLocalStorage);

export const getAllAccounts = async () =>
  JSON.parse((await localStore.getItem(ALL_ACCOUNTS)) || "[]");

export const saveAllAccounts = async (allAccounts: Account[]) => {
  await localStore.setItem(ALL_ACCOUNTS, JSON.stringify(allAccounts));
};

export const getApplicationId = async () =>
  (await localStore.getItem(APP_ID)) || "";

export const saveApplicationId = async (id: string) => {
  await localStore.setItem(APP_ID, id);
};

export const getSelectedConnection = async () =>
  (await localStore.getItem(SELECTED_CONNECTION)) || "";

export const saveSelectedConnection = async (connection: string) => {
  await localStore.setItem(SELECTED_CONNECTION, connection);
};

export const getIsHiddenMode = async () =>
  (await localStore.getItem(IS_HIDDEN_MODE)) || false;

export const saveIsHiddenMode = async (mode: boolean) => {
  await localStore.setItem(IS_HIDDEN_MODE, mode);
};

export const getAssetsCached = async (): Promise<Asset[]> =>
  JSON.parse((await localStore.getItem(ASSETS_CACHE)) || "[]");

export const saveAssetsCached = async (assets: Asset[]) => {
  await localStore.setItem(ASSETS_CACHE, JSON.stringify(assets));
};
