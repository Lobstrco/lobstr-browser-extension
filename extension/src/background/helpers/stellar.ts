import { Asset, AssetSimple } from "@shared/constants/types";

export const getAssetString = ({ code, issuer }: AssetSimple | Asset) =>
  `${code}:${issuer}`;
