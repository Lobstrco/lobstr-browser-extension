const getNumDecimals = (value: number): number => {
  if (value < 10) {
    return 7;
  }
  if (value < 1000) {
    return 4;
  }

  return 2;
};

export const formatBalance = (
  balance: number,
  withRounding?: boolean,
): string => {
  const precision = getNumDecimals(Math.abs(balance));

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: withRounding ? precision : 7,
  }).format(balance);
};

export const formatCurrencyBalance = (
  balance: number,
  numDecimals: number,
): string => {
  const precision = getNumDecimals(Math.abs(balance));

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: numDecimals ?? precision,
  }).format(balance);
};
