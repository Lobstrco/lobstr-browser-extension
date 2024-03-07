import { ALL_ACCOUNTS, APP_ID } from "constants/localStorageTypes";
import {
  dataStorageAccess,
  browserLocalStorage,
} from "background/helpers/dataStorage";

const localStore = dataStorageAccess(browserLocalStorage);

export const getAllAccounts = async () =>
  JSON.parse((await localStore.getItem(ALL_ACCOUNTS)) || "[]");

export const getApplicationId = async () =>
  (await localStore.getItem(APP_ID)) || "";
