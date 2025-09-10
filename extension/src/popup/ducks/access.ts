import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  rejectAccess as internalRejectAccess,
  grantAccess as internalGrantAccess,
  sign as internalSign,
  rejectSigning as internalRejectSigning,
} from "@shared/api/internal";

export const grantAccess = createAsyncThunk("grantAccess", internalGrantAccess);

export const rejectAccess = createAsyncThunk(
  "rejectAccess",
  internalRejectAccess,
);

export const sign = createAsyncThunk(
  "sign",
  internalSign,
);

// Basically an alias for metrics purposes
export const rejectSigning = createAsyncThunk(
  "rejectSigning",
  internalRejectSigning,
);

// Basically an alias for metrics purposes
export const rejectBlob = createAsyncThunk("rejectBlob", internalRejectAccess);
export const rejectAuthEntry = createAsyncThunk(
  "rejectAuthEntry",
  internalRejectAccess,
);
