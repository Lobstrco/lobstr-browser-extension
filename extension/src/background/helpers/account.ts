import { Account, Asset } from "@shared/constants/types";
import { LocalStorage } from "./dataStorage";
import {
  ALL_ACCOUNTS,
  APP_ID,
  ASSETS_CACHE,
  IS_HIDDEN_MODE,
  SELECTED_CONNECTION,
} from "constants/localStorageTypes";


export const getAllAccounts = async () =>
  (await LocalStorage.getItem(ALL_ACCOUNTS)) || [];

export const saveAllAccounts = async (allAccounts: Account[]) => {
  await LocalStorage.setItem(ALL_ACCOUNTS, allAccounts);
};

export const getApplicationId = async () =>
  (await LocalStorage.getItem(APP_ID)) || "";

export const saveApplicationId = async (id: string) => {
  await LocalStorage.setItem(APP_ID, id);
};

export const getSelectedConnection = async () =>
  (await LocalStorage.getItem(SELECTED_CONNECTION)) || "";

export const saveSelectedConnection = async (connection: string) => {
  await LocalStorage.setItem(SELECTED_CONNECTION, connection);
};

export const getIsHiddenMode = async () =>
  (await LocalStorage.getItem(IS_HIDDEN_MODE)) || false;

export const saveIsHiddenMode = async (mode: boolean) => {
  await LocalStorage.setItem(IS_HIDDEN_MODE, mode);
};

export const getAssetsCached = async (): Promise<Asset[]> =>
  (await LocalStorage.getItem(ASSETS_CACHE)) || [];

export const saveAssetsCached = async (assets: Asset[]) => {
  await LocalStorage.setItem(ASSETS_CACHE, assets);
};
