// import { Account } from "@shared/constants/types";

import { GetConnectionResponse } from "@shared/constants/types";
import { TX_STATUS } from "@shared/constants/services";
import { deleteRequest, get, post } from "./helpers/request";

const API_URL = "https://staging.lobstr.co";

const LOGIN_POLLING_INTERVAL = 5000;
const LOGIN_POLLING_ATTEMPTS = 60; // 5 minutes

let timeout: any;

export const checkConnection = (uuid: string): Promise<boolean> =>
  get(`${API_URL}/api/v1/lobstr-extension/connections/${uuid}/`)
    .then(() => true)
    .catch(() => false);

export const checkLogin = (
  uuid: string,
  resolver?: (value: any) => any,
  rejecter?: (value: any) => any,
  attempt: number = 0,
): Promise<any> => {
  if (attempt === 0) {
    clearTimeout(timeout);
  }
  if (attempt > LOGIN_POLLING_ATTEMPTS) {
    return rejecter ? rejecter({ error: "Connection timeout" }) : null;
  }
  return get(`${API_URL}/api/v1/lobstr-extension/connections/${uuid}/`)
    .then((data: GetConnectionResponse) => {
      const { connection_key, public_key, federation_address, user_agent } =
        data;

      return resolver
        ? resolver({
            publicKey: public_key,
            connectionKey: connection_key,
            federation: federation_address,
            userAgent: user_agent,
            lastActivityTime: Date.now(),
          })
        : {
            public: public_key,
            connectionKey: connection_key,
            federation: federation_address,
            userAgent: user_agent,
            lastActivityTime: Date.now(),
          };
    })
    .catch(() => {
      if (resolver) {
        timeout = setTimeout(
          () => checkLogin(uuid, resolver, rejecter, attempt + 1),
          LOGIN_POLLING_INTERVAL,
        );
        return;
      }

      return new Promise((resolve, reject) => {
        timeout = setTimeout(
          () => checkLogin(uuid, resolve, reject, attempt + 1),
          LOGIN_POLLING_INTERVAL,
        );
      });
    });
};

export const logoutFromLobstr = (uuid: string) =>
  deleteRequest(`${API_URL}/api/v1/lobstr-extension/connections/${uuid}/`);

export const signWithLobstr = (
  xdr: string,
  uuid: string,
  domain: string,
): Promise<string> => {
  const body = JSON.stringify({ xdr, action: "sign", domain });
  return post(
    `${API_URL}/api/v1/lobstr-extension/connections/${uuid}/transactions/`,
    { body },
  )
    .then((res) => res.id)
    .then((id) => checkTxStatus(uuid, id))
    .catch((e) => ({ error: e }));
};

const PollingMap = new Map<
  string,
  { timeout: any; rejecter: (value: any) => any }
>();
const TX_POLLING_INTERVAL = 5000;
const TX_POLLING_ATTEMPTS = 720; // 1 hour

const checkTxStatus = (
  uuid: string,
  id: string,
  resolver?: (value: any) => any,
  rejecter?: (value: any) => any,
  attempt: number = 0,
): Promise<any> =>
  get(
    `${API_URL}/api/v1/lobstr-extension/connections/${uuid}/transactions/${id}/`,
  ).then(({ xdr, state }) => {
    if (attempt === 0 && PollingMap.has(uuid)) {
      clearTimeout(PollingMap.get(uuid)!.timeout);
      PollingMap.get(uuid)!.rejecter({ error: "Transaction polling aborted" });
    }
    if (attempt > TX_POLLING_ATTEMPTS) {
      PollingMap.delete(uuid);
      return rejecter
        ? rejecter({ error: "Transaction polling timeout" })
        : null;
    }
    if (state === TX_STATUS.signed && resolver) {
      PollingMap.delete(uuid);
      return resolver(xdr);
    }
    if (state === TX_STATUS.rejected && resolver) {
      PollingMap.delete(uuid);
      return resolver("");
    }

    if (resolver && rejecter) {
      PollingMap.set(uuid, {
        timeout: setTimeout(
          () => checkTxStatus(uuid, id, resolver, rejecter, attempt + 1),
          TX_POLLING_INTERVAL,
        ),
        rejecter,
      });
      return;
    }

    return new Promise((resolve, reject) =>
      PollingMap.set(uuid, {
        timeout: setTimeout(
          () => checkTxStatus(uuid, id, resolve, reject, attempt + 1),
          TX_POLLING_INTERVAL,
        ),
        rejecter: reject,
      }),
    );
  });
