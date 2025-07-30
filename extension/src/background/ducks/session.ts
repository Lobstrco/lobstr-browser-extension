import { createSelector, createSlice } from "@reduxjs/toolkit";
import { Account } from "@shared/constants/types";

const initialState = {
    allAccounts: [] as Account[],
    applicationId: "",
    selectedConnection: "",
    isHiddenMode: false,
};

interface UiData {
    allAccounts: Account[];
    applicationId: string;
    selectedConnection: string;
    isHiddenMode: boolean;
}

export const sessionSlice = createSlice({
    name: "session",
    initialState,
    reducers: {
        reset: () => initialState,
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
        selectConnection,
        loadSavedState,
        toggleHiddenMode,
    },
} = sessionSlice;

export const selectedConnectionSelector = createSelector(
    sessionSelector,
    (session) => session.selectedConnection,
);

export const isHiddenModeSelector = createSelector(
    sessionSelector,
    (session) => session.isHiddenMode,
);
