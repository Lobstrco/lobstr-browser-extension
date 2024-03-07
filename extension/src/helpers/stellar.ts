export const truncateString = (str: string) =>
  str ? `${str.slice(0, 4)}…${str.slice(-4)}` : "";

export const truncatedPublicKey = (publicKey: string) =>
  truncateString(publicKey);

export const truncatedFedAddress = (addr: string) => {
  if (!addr || addr.indexOf("*") === -1) {
    return addr;
  }
  const domain = addr.split("*")[1];
  return `${addr[0]}...*${domain}`;
};

export const truncatedPoolId = (poolId: string) => truncateString(poolId);

export const getCanonicalFromAsset = (
  assetCode: string,
  assetIssuer: string,
) => {
  if (assetCode === "XLM" && !assetIssuer) {
    return "native";
  }
  if (!assetIssuer) {
    return assetCode;
  }
  return `${assetCode}:${assetIssuer}`;
};

export const formatDomain = (domain: string) => {
  if (domain) {
    domain.replace("https://", "").replace("www.", "");
    return domain;
  }
  return "Stellar Network";
};

export const isMuxedAccount = (publicKey: string) => publicKey.startsWith("M");

export const isFederationAddress = (address: string) => address.includes("*");
