import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  rejectAccess as internalRejectAccess,
  grantAccess as internalGrantAccess,
  signTransaction as internalSignTransaction,
  rejectTransaction as internalRejectTransaction,
} from "@shared/api/internal";

export const grantAccess = createAsyncThunk("grantAccess", internalGrantAccess);

export const rejectAccess = createAsyncThunk(
  "rejectAccess",
  internalRejectAccess,
);

export const signTransaction = createAsyncThunk(
  "signTransaction",
  internalSignTransaction,
);

// Basically an alias for metrics purposes
export const rejectTransaction = createAsyncThunk(
  "rejectTransaction",
  internalRejectTransaction,
);

// Basically an alias for metrics purposes
export const rejectBlob = createAsyncThunk("rejectBlob", internalRejectAccess);
export const rejectAuthEntry = createAsyncThunk(
  "rejectAuthEntry",
  internalRejectAccess,
);
