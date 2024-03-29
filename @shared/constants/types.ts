import { EXTERNAL_SERVICE_TYPES, SERVICE_TYPES } from "./services";
import { APPLICATION_STATES } from "./applicationState";

export interface Request {
  applicationState: APPLICATION_STATES;
  publicKey: string;
  type: SERVICE_TYPES;
  url: string;
  uuid: string;
  connectionKey: string;
}

export interface GetPublicKeyResponse {
  publicKey: string;
  connectionKey: string;
}

export interface ExternalRequestTx {
  transactionXdr: string;
  connectionKey: string;
  type: EXTERNAL_SERVICE_TYPES;
}

export interface Account {
  publicKey: string;
  federation: string;
  connectionKey: string;
  userAgent: string;
  lastActivityTime: number;
}

export interface Response {
  allAccounts: Account[];
  applicationState: APPLICATION_STATES;
  error: string;
  applicationId: string;
}

export interface ErrorMessage {
  errorMessage: string;
}

export interface GetConnectionResponse {
  connection_key: string;
  public_key: string;
  federation_address: string;
  user_agent: string;
}

declare global {
  interface Window {
    lobstrSignerExtension: boolean;
    lobstrSignerExtensionApi: {
      [key: string]: any;
    };
  }
}
