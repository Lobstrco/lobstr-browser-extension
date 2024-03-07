import React, { useEffect } from "react";
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { APPLICATION_STATES } from "@shared/constants/applicationState";

import { applicationStateSelector, loadState } from "./ducks/authService";
import Welcome from "./views/Welcome/Welcome";
import Connect from "./views/Connect/Connect";
import { AppDispatch } from "./App";
import Loading from "./components/Loading/Loading";
import Wallets from "./views/Wallets/Wallets";
import GrantAccess from "./views/GrantAccess/GrantAccess";
import SendTransaction from "./views/SendTransaction/SendTransaction";
import { ROUTES } from "popup/constants/routes";
import { navigate } from "popup/ducks/views";

export const AuthRoute = ({
  children,
}: {
  children: React.ReactElement;
}): React.ReactElement | null => {
  const appState = useSelector(applicationStateSelector);

  if (appState === APPLICATION_STATES.APPLICATION_LOADING) {
    return null;
  }

  if (appState === APPLICATION_STATES.APPLICATION_ERROR) {
    return <div>ERROR</div>;
  }

  if (appState === APPLICATION_STATES.APPLICATION_LOGGED) {
    return <Navigate to={ROUTES.wallets} />;
  }

  return children;
};

// Broadcast to Redux when the route changes. We don't store location state, but
// we do use the actions for metrics.
const RouteListener = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(navigate(location));
  }, [dispatch, location]);

  return null;
};

export const Router = () => {
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(loadState());
  }, [dispatch]);

  const appState = useSelector(applicationStateSelector);

  if (appState === APPLICATION_STATES.APPLICATION_LOADING) {
    return <Loading />;
  }

  return (
    <HashRouter>
      <RouteListener />
      <Routes>
        <Route
          path={ROUTES.welcome}
          element={
            <AuthRoute>
              <Welcome />
            </AuthRoute>
          }
        />
        <Route path={ROUTES.connect} element={<Connect />} />
        <Route path={ROUTES.wallets} element={<Wallets />} />
        <Route path={ROUTES.grantAccess} element={<GrantAccess />} />
        <Route path={ROUTES.sendTransaction} element={<SendTransaction />} />
      </Routes>
    </HashRouter>
  );
};
