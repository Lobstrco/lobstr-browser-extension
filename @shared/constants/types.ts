import * as StellarSdk from "@stellar/stellar-sdk";
import { EXTERNAL_SERVICE_TYPES, SERVICE_TYPES } from "./services";
import { APPLICATION_STATES } from "./applicationState";

export interface Request {
  applicationState: APPLICATION_STATES;
  publicKey: string;
  type: SERVICE_TYPES;
  url: string;
  uuid: string;
  connectionKey: string;
  assets: AssetSimple[];
  data: any;
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
  nickname: string;
  connectionKey: string;
  userAgent: string;
  lastActivityTime: number;
  currency: Currency;
}

export interface Response {
  allAccounts: Account[];
  applicationState: APPLICATION_STATES;
  error: string;
  applicationId: string;
  selectedConnection: string;
  isHiddenMode: boolean;
  assets: Asset[];
  quotes: LumenQuote[];
}

export interface ErrorMessage {
  errorMessage: string;
}

export interface GetConnectionResponse {
  connection_key: string;
  public_key: string;
  federation_address: string;
  nickname: string;
  user_agent: string;
  currency: Currency;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  display_decimals: number;
  is_currency_first: boolean;
}

export interface AssetSimple {
  code: string;
  issuer: string;
}

export interface Asset {
  accounts_authorized: number;
  anchor_asset: string;
  anchor_asset_type: string;
  asset_string: string;
  auth_clawback_enabled: boolean;
  auth_immutable: boolean;
  auth_required: boolean;
  auth_revocable: boolean;
  balances_authorized: string;
  claimable_balances_amount: string;
  code: string;
  conditions: string;
  desc: string;
  first_transaction: string;
  home_domain: string;
  image: string;
  is_asset_anchored: boolean;
  is_supply_locked: boolean;
  is_verified: boolean;
  issuer: string | undefined;
  liquidity_pools_amount: string;
  name: string;
}

interface RateDetails {
  code: string;
  symbol: string;
  display_decimals: number;
  is_currency_first: boolean;
  rate: number;
}

interface LastNativeRate {
  base_asset: string;
  counter_asset: string;
  base_amount: string;
  counter_amount: string;
  rate: number;
  reverse_rate: number;
  created_at: string;
  updated_at: string;
  added_at: string;
  timestamp: number;
}

export interface AlternativeRatesResponse {
  last_native_rate: LastNativeRate | null;
  alternative_rate: RateDetails;
  usd_rate: RateDetails;
  code: string;
  issuer: string;
}

export interface LumenQuote {
  currency: string;
  price: number;
  percent_change_24h: number;
}

export interface BalanceAssetExtended
  extends StellarSdk.Horizon.HorizonApi.BalanceLineAsset {
  nativeBalance: number;
}

export interface BalanceNativeExtended
  extends StellarSdk.Horizon.HorizonApi.BalanceLineNative {
  nativeBalance: number;
}

declare global {
  interface Window {
    lobstrSignerExtension: boolean;
    lobstrSignerExtensionApi: {
      [key: string]: any;
    };
  }
}
