import { Asset, AssetSimple, ErrorMessage } from "@shared/constants/types";
import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { loadCachedAssets, processNewAssets } from "@shared/api/internal";

interface InitialState {
  assets: Partial<Asset>[];
  isLoadedFromCache: boolean;
  error: string;
}

const initialState: InitialState = {
  assets: [],
  error: "",
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
  } catch (e: any) {
    console.error(e);
    return thunkApi.rejectWithValue({ errorMessage: e.message });
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
  } catch (e: any) {
    console.error(e);
    return thunkApi.rejectWithValue({ errorMessage: e.message });
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
    builder.addCase(loadCachedAssetsInfo.rejected, (state, action) => {
      const { errorMessage } = action.payload || { errorMessage: "" };

      return {
        ...state,
        error: errorMessage,
      };
    });
    builder.addCase(processNew.fulfilled, (state, action) => {
      const { assets } = action.payload;

      return {
        ...state,
        assets,
      };
    });
    builder.addCase(processNew.rejected, (state, action) => {
      const { errorMessage } = action.payload || { errorMessage: "" };

      return {
        ...state,
        error: errorMessage,
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
