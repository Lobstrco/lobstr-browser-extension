import { Asset, AssetSimple, ErrorMessage } from "@shared/constants/types";
import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { loadCachedAssets, processNewAssets } from "@shared/api/internal";
import { normalizeError } from "@shared/helpers/errors";
import { ERROR_MESSAGES } from "@shared/constants/errorMessages";

// no `error` field on purpose: nothing ever rendered it
interface InitialState {
  assets: Partial<Asset>[];
  isLoadedFromCache: boolean;
}

const initialState: InitialState = {
  assets: [],
  isLoadedFromCache: false,
};

export const loadCachedAssetsInfo = createAsyncThunk<
  { assets: Asset[] },
  void,
  { rejectValue: ErrorMessage }
>("loadCached", async (_, thunkApi) => {
  let res;
  try {
    res = await loadCachedAssets();
    return res;
  } catch (e) {
    console.error(e);
    return thunkApi.rejectWithValue({
      errorMessage: normalizeError(e, ERROR_MESSAGES.ASSETS_LOAD_FAILED),
    });
  }
});

export const processNew = createAsyncThunk<
  { assets: Asset[] },
  AssetSimple[],
  { rejectValue: ErrorMessage }
>("processAssets", async (assets, thunkApi) => {
  let res;
  try {
    res = await processNewAssets(assets);
    return res;
  } catch (e) {
    console.error(e);
    return thunkApi.rejectWithValue({
      errorMessage: normalizeError(e, ERROR_MESSAGES.ASSETS_LOAD_FAILED),
    });
  }
});
const assetsSlice = createSlice({
  name: "assets",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadCachedAssetsInfo.fulfilled, (state, action) => {
      const { assets } = action.payload;

      return {
        ...state,
        assets,
        isLoadedFromCache: true,
      };
    });
    builder.addCase(processNew.fulfilled, (state, action) => {
      const { assets } = action.payload;

      return {
        ...state,
        assets,
      };
    });
  },
});

export const { reducer } = assetsSlice;

const assetsSelector = (state: { assets: InitialState }) => state.assets;

export const isAssetsLoadedSelector = createSelector(
  assetsSelector,
  (state: InitialState) => state.isLoadedFromCache,
);
export const assetsInfoSelector = createSelector(
  assetsSelector,
  (state: InitialState) => state.assets,
);
