// import { Account } from "@shared/constants/types";

import {
    Account,
    GetConnectionResponse,
    LumenQuote,
} from "@shared/constants/types";
import { TX_STATUS } from "@shared/constants/services";
import { ERROR_MESSAGES } from "@shared/constants/errorMessages";
import { delay } from "@shared/helpers/delay";
import { deleteRequest, get, post } from "./helpers/request";

const API_URL = "https://lobstr.co";

const LOGIN_POLLING_INTERVAL = 5000;
const LOGIN_POLLING_ATTEMPTS = 60; // 5 minutes

let loginPolling: AbortController | null = null;

export const cancelLoginPolling = () => {
    loginPolling?.abort();
    loginPolling = null;
};

const toConnection = (
    data: GetConnectionResponse,
): Omit<Account, "lastActivityTime"> => ({
    publicKey: data.public_key,
    connectionKey: data.connection_key,
    federation: data.federation_address,
    nickname: data.nickname,
    userAgent: data.user_agent,
    currency: data.currency,
});

export const updateConnection = (
    connection: Account,
): Promise<Omit<Account, "lastActivityTime"> | null> =>
    get(
        `${API_URL}/api/v1/lobstr-extension/connections/${connection.connectionKey}/`,
    )
        .then(toConnection)
        .catch((error) => {
            const status = error?.response?.status;
            return status === 404 ? null : connection;
        });

export const checkLogin = async (uuid: string): Promise<Account> => {
    // only one login poll at a time, so starting one ends whatever came before
    cancelLoginPolling();
    const controller = new AbortController();
    loginPolling = controller;
    const { signal } = controller;
    const url = `${API_URL}/api/v1/lobstr-extension/connections/${uuid}/`;

    try {
        for (let attempt = 0; attempt <= LOGIN_POLLING_ATTEMPTS; attempt++) {
            if (signal.aborted) {
                throw ERROR_MESSAGES.LOGIN_CANCELLED;
            }
            try {
                const data: GetConnectionResponse = await get(url, { signal });
                return { ...toConnection(data), lastActivityTime: Date.now() };
            } catch {
                // the connection does not exist until the QR code is scanned,
                // so any failure here is the normal "not yet" answer
                if (signal.aborted) {
                    throw ERROR_MESSAGES.LOGIN_CANCELLED;
                }
            }
            if (attempt < LOGIN_POLLING_ATTEMPTS) {
                await delay(LOGIN_POLLING_INTERVAL, signal);
            }
        }
        throw ERROR_MESSAGES.CONNECTION_TIMEOUT;
    } finally {
        if (loginPolling === controller) {
            loginPolling = null;
        }
    }
};

export const logoutFromLobstr = (uuid: string) =>
    deleteRequest(`${API_URL}/api/v1/lobstr-extension/connections/${uuid}/`);

export const signWithLobstr = async (
    dataToSign: string,
    uuid: string,
    domain: string,
    signType: "transaction" | "message",
    signal: AbortSignal,
): Promise<string> => {
    const request =
        signType === "transaction"
            ? requestTransactionSign
            : requestMessageSign;
    try {
        const { id } = await request(dataToSign, uuid, domain, signal);
        const resolveData = await checkSignStatus(uuid, id, signType, signal);
        if (!resolveData) {
            throw ERROR_MESSAGES.USER_DECLINED_ACCESS;
        }
        return resolveData;
    } catch (e) {
        // an aborted fetch rejects with a DOMException, which would be masked as "Sign failed"
        throw signal.aborted ? ERROR_MESSAGES.SIGN_REQUEST_CANCELLED : e;
    }
};

function requestTransactionSign(
    dataToSign: string,
    uuid: string,
    domain: string,
    signal: AbortSignal,
) {
    const body = JSON.stringify({ xdr: dataToSign, action: "sign", domain });
    return post(
        `${API_URL}/api/v1/lobstr-extension/connections/${uuid}/transactions/`,
        { body, signal },
    );
}

function requestMessageSign(
    dataToSign: string,
    uuid: string,
    domain: string,
    signal: AbortSignal,
) {
    const body = JSON.stringify({ message: dataToSign, domain });
    return post(
        `${API_URL}/api/v1/lobstr-extension/connections/${uuid}/messages/`,
        { body, signal },
    );
}

const TX_POLLING_INTERVAL = 5000;
const TX_POLLING_ATTEMPTS = 720; // 1 hour
// budgeted against the hour-long wait: three tries would end it after ~15s of flaky network
const MAX_CONSECUTIVE_FAILURES = 12;

/** No status means the transport failed; those and 5xx are worth another attempt. */
const isRetriable = (error: unknown): boolean => {
    const status = (error as { response?: { status?: number } })?.response
        ?.status;
    return !status || status >= 500 || status === 408 || status === 429;
};

const checkSignStatus = async (
    uuid: string,
    id: string,
    signType: "transaction" | "message",
    signal: AbortSignal,
): Promise<string> => {
    const urlPath = signType === "transaction" ? "transactions" : "messages";
    const url = `${API_URL}/api/v1/lobstr-extension/connections/${uuid}/${urlPath}/${id}/`;
    let consecutiveFailures = 0;

    for (let attempt = 0; attempt <= TX_POLLING_ATTEMPTS; attempt++) {
        if (signal.aborted) {
            throw ERROR_MESSAGES.SIGN_REQUEST_CANCELLED;
        }
        try {
            const response = await get(url, { signal });
            consecutiveFailures = 0;
            if (response.state === TX_STATUS.signed) {
                return signType === "transaction"
                    ? response.xdr
                    : response.signature;
            }
            // an empty result is turned into "user declined" by the caller
            if (response.state === TX_STATUS.rejected) {
                return "";
            }
        } catch (e) {
            consecutiveFailures += 1;
            if (
                signal.aborted ||
                !isRetriable(e) ||
                consecutiveFailures >= MAX_CONSECUTIVE_FAILURES
            ) {
                throw e;
            }
        }
        // returns early on abort; the check at the top of the loop ends it
        if (attempt < TX_POLLING_ATTEMPTS) {
            await delay(TX_POLLING_INTERVAL, signal);
        }
    }
    throw ERROR_MESSAGES.SIGN_REQUEST_TIMEOUT;
};

export const getLastLumenQuotes = (): Promise<LumenQuote[]> =>
    get(`${API_URL}/api/latest-lumen-quotes/`);
