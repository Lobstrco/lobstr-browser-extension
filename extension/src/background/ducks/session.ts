import { createSelector, createSlice } from "@reduxjs/toolkit";
import { Account } from "@shared/constants/types";

const initialState = {
  allAccounts: [] as Account[],
  isStorageChecked: false,
  applicationId: "",
};

interface UiData {
  allAccounts: Account[];
  isStorageChecked: boolean;
  applicationId: string;
}

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    reset: () => initialState,
    setStorageChecked: (state) => ({
      ...state,
      isStorageChecked: true,
    }),
    loadSavedState: (
      state,
      action: { payload: { allAccounts: Account[]; applicationId: string } },
    ) => {
      const { allAccounts = [], applicationId = "" } = action.payload;

      return {
        ...state,
        allAccounts,
        applicationId,
      };
    },
    logIn: (state, action: { payload: { allAccounts: Account[] } }) => {
      const { allAccounts = [] } = action.payload;

      return {
        ...state,
        allAccounts,
      };
    },
    logOut: (state, action: { payload: { allAccounts: Account[] } }) => {
      const { allAccounts = [] } = action.payload;

      return {
        ...state,
        allAccounts,
      };
    },
  },
});

export const sessionSelector = (state: { session: UiData }) => state.session;

export const {
  actions: { reset, logIn, logOut, setStorageChecked, loadSavedState },
} = sessionSlice;

export const allAccountsSelector = createSelector(
  sessionSelector,
  (session) => session.allAccounts || [],
);

export const isStorageCheckedSelector = createSelector(
  sessionSelector,
  (session) => session.isStorageChecked,
);

export const applicationIdSelector = createSelector(
  sessionSelector,
  (session) => session.applicationId,
);
