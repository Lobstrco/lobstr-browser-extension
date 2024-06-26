import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { APPLICATION_STATES } from "@shared/constants/applicationState";

import {
  loadState as loadStateService,
  login as loginService,
  logout as logoutService,
  selectConnection as selectConnectionService,
  toggleHiddenMode as toggleHiddenModeService,
} from "@shared/api/internal";
import { Account, ErrorMessage } from "@shared/constants/types";

interface InitialState {
  allAccounts: Account[];
  applicationState: APPLICATION_STATES;
  applicationId: string;
  error: string;
  selectedConnection: string;
  isHiddenMode: boolean;
}

const initialState: InitialState = {
  allAccounts: [],
  applicationId: "",
  applicationState: APPLICATION_STATES.APPLICATION_LOADING,
  error: "",
  selectedConnection: "",
  isHiddenMode: false,
};

export const loadState = createAsyncThunk<
  {
    allAccounts: Account[];
    applicationId: string;
    applicationState: APPLICATION_STATES;
    selectedConnection: string;
    isHiddenMode: boolean;
  },
  void,
  { rejectValue: ErrorMessage }
>("loadState", async (_, thunkApi) => {
  let res;
  try {
    res = await loadStateService();
    return res;
  } catch (e: any) {
    console.error(e);
    return thunkApi.rejectWithValue({ errorMessage: e.message });
  }
});

export const login = createAsyncThunk<
  { allAccounts: Account[]; error: string; selectedConnection: string },
  string,
  { rejectValue: ErrorMessage }
>("login", async (uuid: string, thunkApi) => {
  let res;
  try {
    res = await loginService(uuid);
  } catch (e: any) {
    console.error(e);
    return thunkApi.rejectWithValue({ errorMessage: e.message });
  }

  if (res.error) {
    return thunkApi.rejectWithValue({ errorMessage: res.error });
  }

  return res;
});

export const selectConnection = createAsyncThunk<
  { selectedConnection: string },
  string,
  { rejectValue: ErrorMessage }
>("selectAccount", async (connectionKey: string, thunkApi) => {
  let res;
  try {
    res = await selectConnectionService(connectionKey);
  } catch (e: any) {
    console.error(e);
    return thunkApi.rejectWithValue({ errorMessage: e.message });
  }

  return res;
});

export const logout = createAsyncThunk<
  { allAccounts: Account[]; selectedConnection: string },
  string,
  { rejectValue: ErrorMessage }
>("logout", async (connectionKey: string, thunkApi) => {
  let res;
  try {
    res = await logoutService(connectionKey);
  } catch (e: any) {
    console.error(e);
    return thunkApi.rejectWithValue({ errorMessage: e.message });
  }

  return res;
});

export const toggleHiddenMode = createAsyncThunk<
  { isHiddenMode: boolean },
  void,
  { rejectValue: ErrorMessage }
>("toggleHiddenMode", async (_, thunkApi) => {
  let res;
  try {
    res = await toggleHiddenModeService();
  } catch (e: any) {
    console.error(e);
    return thunkApi.rejectWithValue({ errorMessage: e.message });
  }

  return res;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearApiError(state) {
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadState.fulfilled, (state, action) => {
      const { allAccounts, applicationId, selectedConnection, isHiddenMode } =
        action.payload;

      return {
        ...state,
        allAccounts,
        applicationId,
        selectedConnection,
        isHiddenMode,
        applicationState: allAccounts.length
          ? APPLICATION_STATES.APPLICATION_LOGGED
          : APPLICATION_STATES.APPLICATION_STARTED,
      };
    });
    builder.addCase(loadState.rejected, (state, action) => {
      const { errorMessage } = action.payload || { errorMessage: "" };

      return {
        ...state,
        error: errorMessage,
        applicationState: APPLICATION_STATES.APPLICATION_ERROR,
      };
    });
    builder.addCase(login.fulfilled, (state, action) => {
      const { allAccounts, selectedConnection } = action.payload;

      return {
        ...state,
        error: "",
        allAccounts,
        selectedConnection,
        applicationState: APPLICATION_STATES.APPLICATION_LOGGED,
      };
    });
    builder.addCase(login.rejected, (state, action) => {
      const { errorMessage } = action.payload || { errorMessage: "" };

      return {
        ...state,
        error: errorMessage,
      };
    });
    builder.addCase(selectConnection.fulfilled, (state, action) => {
      const { selectedConnection } = action.payload;

      return {
        ...state,
        selectedConnection,
      };
    });
    builder.addCase(selectConnection.rejected, (state, action) => {
      const { errorMessage } = action.payload || { errorMessage: "" };

      return {
        ...state,
        error: errorMessage,
      };
    });
    builder.addCase(logout.fulfilled, (state, action) => {
      const { allAccounts, selectedConnection } = action.payload;

      return {
        ...state,
        error: "",
        allAccounts,
        selectedConnection,
        applicationState: allAccounts.length
          ? APPLICATION_STATES.APPLICATION_LOGGED
          : APPLICATION_STATES.APPLICATION_STARTED,
      };
    });
    builder.addCase(logout.rejected, (state, action) => {
      const { errorMessage } = action.payload || { errorMessage: "" };

      return {
        ...state,
        error: errorMessage,
      };
    });
    builder.addCase(toggleHiddenMode.fulfilled, (state, action) => {
      const { isHiddenMode } = action.payload;

      return {
        ...state,
        isHiddenMode,
      };
    });
    builder.addCase(toggleHiddenMode.rejected, (state, action) => {
      const { errorMessage } = action.payload || { errorMessage: "" };

      return {
        ...state,
        error: errorMessage,
      };
    });
  },
});

export const { reducer } = authSlice;

const authSelector = (state: { auth: InitialState }) => state.auth;

export const allAccountsSelector = createSelector(
  authSelector,
  (state: InitialState) => state.allAccounts,
);

export const selectedConnectionSelector = createSelector(
  authSelector,
  (state: InitialState) => state.selectedConnection,
);

export const isHiddenModeSelector = createSelector(
  authSelector,
  (state: InitialState) => state.isHiddenMode,
);
export const applicationStateSelector = createSelector(
  authSelector,
  (state: InitialState) => state.applicationState,
);
export const applicationIdSelector = createSelector(
  authSelector,
  (state: InitialState) => state.applicationId,
);

export const authErrorSelector = createSelector(
  authSelector,
  (auth: InitialState) => auth.error,
);

export const { clearApiError } = authSlice.actions;
