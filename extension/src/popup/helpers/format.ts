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
  if (!withRounding) {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 7,
    }).format(balance);
  }

  const precision = getNumDecimals(Math.abs(balance));

  const roundedValue =
    Math.floor(balance * Math.pow(10, precision)) / Math.pow(10, precision);

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: precision,
  }).format(roundedValue);
};

export const formatCurrencyBalance = (
  balance: number,
  numDecimals: number,
): string => {
  const precision = numDecimals ?? getNumDecimals(Math.abs(balance));

  const roundedValue =
    Math.floor(balance * Math.pow(10, precision)) / Math.pow(10, precision);

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: precision,
    minimumFractionDigits: 2,
  }).format(roundedValue);
};
