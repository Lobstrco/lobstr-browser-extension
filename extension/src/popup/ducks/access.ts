import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  rejectAccess as internalRejectAccess,
  grantAccess as internalGrantAccess,
} from "@shared/api/internal";

export const grantAccess = createAsyncThunk("grantAccess", internalGrantAccess);

export const rejectAccess = createAsyncThunk(
  "rejectAccess",
  internalRejectAccess,
);
