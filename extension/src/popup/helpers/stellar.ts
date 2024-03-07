export const truncateString = (str: string, letters: number) =>
  str ? `${str.slice(0, letters)}...${str.slice(-letters)}` : "";

export const truncatedPublicKey = (publicKey: string) =>
  truncateString(publicKey, 8);
