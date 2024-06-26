import React, { Suspense } from "react";
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { Provider } from "react-redux";

import { Router } from "./Router";
import AppGlobalStyles from "./styles/AppGlobalStyles";
import Loading from "./components/Loading/Loading";
import { reducer as auth } from "popup/ducks/authService";
import { reducer as assets } from "popup/ducks/assets";

const rootReducer = combineReducers({
  auth,
  assets,
});
export type AppState = ReturnType<typeof rootReducer>;
export const store = configureStore({
  reducer: rootReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type AppDispatch = typeof store.dispatch;

export function App() {
  return (
    <Provider store={store}>
      <AppGlobalStyles />
      <Suspense fallback={<Loading />}>
        <Router />
      </Suspense>
    </Provider>
  );
}
