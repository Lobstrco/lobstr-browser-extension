// import { Account } from "@shared/constants/types";

import {
    Account,
    GetConnectionResponse,
    LumenQuote,
} from "@shared/constants/types";
import { TX_STATUS } from "@shared/constants/services";
import { deleteRequest, get, post } from "./helpers/request";

const API_URL = "https://lobstr.co";

const LOGIN_POLLING_INTERVAL = 5000;
const LOGIN_POLLING_ATTEMPTS = 60; // 5 minutes

let timeout: any;

// Function to cancel login polling
export const cancelLoginPolling = () => {
    if (timeout) {
        clearTimeout(timeout);
        timeout = null;
    }
};

export const updateConnection = (
    connection: Account,
): Promise<Omit<Account, "lastActivityTime"> | null> =>
    get(
        `${API_URL}/api/v1/lobstr-extension/connections/${connection.connectionKey}/`,
    )
        .then((res) => {
            const {
                connection_key,
                public_key,
                federation_address,
                nickname,
                user_agent,
                currency,
            } = res;

            return {
                publicKey: public_key,
                connectionKey: connection_key,
                federation: federation_address,
                nickname,
                userAgent: user_agent,
                currency,
            };
        })
        .catch((error) => {
            const status = error?.response?.status;
            return status === 404 ? null : connection;
        });

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
            const {
                connection_key,
                public_key,
                federation_address,
                nickname,
                user_agent,
                currency,
            } = data;

            return resolver
                ? resolver({
                      publicKey: public_key,
                      connectionKey: connection_key,
                      federation: federation_address,
                      nickname,
                      userAgent: user_agent,
                      lastActivityTime: Date.now(),
                      currency,
                  })
                : {
                      publicKey: public_key,
                      connectionKey: connection_key,
                      federation: federation_address,
                      nickname,
                      userAgent: user_agent,
                      lastActivityTime: Date.now(),
                      currency,
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
    dataToSign: string,
    uuid: string,
    domain: string,
    signType: "transaction" | "message",
): Promise<string> => {
    const request =
        signType === "transaction"
            ? requestTransactionSign
            : requestMessageSign;
    return request(dataToSign, uuid, domain)
        .then((res) => res.id)
        .then((id) => checkSignStatus(uuid, id, signType))
        .then((resolveData) =>
            resolveData ? resolveData : Promise.reject("User declined access"),
        );
};

function requestTransactionSign(
    dataToSign: string,
    uuid: string,
    domain: string,
) {
    const body = JSON.stringify({ xdr: dataToSign, action: "sign", domain });
    return post(
        `${API_URL}/api/v1/lobstr-extension/connections/${uuid}/transactions/`,
        { body },
    );
}

function requestMessageSign(dataToSign: string, uuid: string, domain: string) {
    const body = JSON.stringify({ message: dataToSign, domain });
    return post(
        `${API_URL}/api/v1/lobstr-extension/connections/${uuid}/messages/`,
        { body },
    );
}

const PollingMap = new Map<
    string,
    { timeout: any; rejecter: (value: any) => any }
>();
const TX_POLLING_INTERVAL = 5000;
const TX_POLLING_ATTEMPTS = 720; // 1 hour

const checkSignStatus = (
    uuid: string,
    id: string,
    signType: "transaction" | "message",
    resolver?: (value: any) => any,
    rejecter?: (value: any) => any,
    attempt: number = 0,
): Promise<any> => {
    const urlPath = signType === "transaction" ? "transactions" : "messages";
    return get(
        `${API_URL}/api/v1/lobstr-extension/connections/${uuid}/${urlPath}/${id}/`,
    ).then((response) => {
        if (attempt === 0 && PollingMap.has(uuid)) {
            clearTimeout(PollingMap.get(uuid)!.timeout);
            PollingMap.get(uuid)!.rejecter({
                error: "Transaction polling aborted",
            });
        }
        if (attempt > TX_POLLING_ATTEMPTS) {
            PollingMap.delete(uuid);
            return rejecter
                ? rejecter({ error: "Transaction polling timeout" })
                : null;
        }
        if (response.state === TX_STATUS.signed && resolver) {
            PollingMap.delete(uuid);
            const resolveData =
                signType === "transaction" ? response.xdr : response.signature;
            return resolver(resolveData);
        }
        if (response.state === TX_STATUS.rejected && resolver) {
            PollingMap.delete(uuid);
            return resolver("");
        }

        if (resolver && rejecter) {
            PollingMap.set(uuid, {
                timeout: setTimeout(
                    () =>
                        checkSignStatus(
                            uuid,
                            id,
                            signType,
                            resolver,
                            rejecter,
                            attempt + 1,
                        ),
                    TX_POLLING_INTERVAL,
                ),
                rejecter,
            });
            return;
        }

        return new Promise((resolve, reject) =>
            PollingMap.set(uuid, {
                timeout: setTimeout(
                    () =>
                        checkSignStatus(
                            uuid,
                            id,
                            signType,
                            resolve,
                            reject,
                            attempt + 1,
                        ),
                    TX_POLLING_INTERVAL,
                ),
                rejecter: reject,
            }),
        );
    });
};

export const getLastLumenQuotes = (): Promise<LumenQuote[]> =>
    get(`${API_URL}/api/latest-lumen-quotes/`);
