import { createSelector, createSlice } from "@reduxjs/toolkit";
import { Account } from "@shared/constants/types";

const initialState = {
  allAccounts: [] as Account[],
  isStorageChecked: false,
  applicationId: "",
  selectedConnection: "",
  isHiddenMode: false,
};

interface UiData {
  allAccounts: Account[];
  isStorageChecked: boolean;
  applicationId: string;
  selectedConnection: string;
  isHiddenMode: boolean;
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
      action: {
        payload: {
          allAccounts: Account[];
          applicationId: string;
          selectedConnection: string;
          isHiddenMode: boolean;
        };
      },
    ) => {
      const {
        allAccounts = [],
        applicationId = "",
        selectedConnection = "",
        isHiddenMode = true,
      } = action.payload;

      return {
        ...state,
        allAccounts,
        applicationId,
        selectedConnection,
        isHiddenMode,
      };
    },
    logIn: (
      state,
      action: {
        payload: { allAccounts: Account[] };
      },
    ) => {
      const { allAccounts = [] } = action.payload;

      return {
        ...state,
        allAccounts,
      };
    },
    selectConnection: (
      state,
      action: { payload: { selectedConnection: string } },
    ) => {
      const { selectedConnection = "" } = action.payload;

      return {
        ...state,
        selectedConnection,
      };
    },
    logOut: (state, action: { payload: { allAccounts: Account[] } }) => {
      const { allAccounts = [] } = action.payload;

      return {
        ...state,
        allAccounts,
      };
    },
    toggleHiddenMode: (state) => ({
      ...state,
      isHiddenMode: !state.isHiddenMode,
    }),
  },
});

export const sessionSelector = (state: { session: UiData }) => state.session;

export const {
  actions: {
    reset,
    logIn,
    logOut,
    setStorageChecked,
    selectConnection,
    loadSavedState,
    toggleHiddenMode,
  },
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

export const selectedConnectionSelector = createSelector(
  sessionSelector,
  (session) => session.selectedConnection,
);

export const isHiddenModeSelector = createSelector(
  sessionSelector,
  (session) => session.isHiddenMode,
);
