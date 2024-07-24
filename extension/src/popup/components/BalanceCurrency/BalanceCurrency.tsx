import * as React from "react";
import styled from "styled-components";
import {
  Account,
  BalanceAssetExtended,
  BalanceNativeExtended,
  LumenQuote,
} from "@shared/constants/types";
import { formatCurrencyBalance } from "../../helpers/format";
import { COLORS } from "../../styles/colors";

const Container = styled.span`
  font-size: 1.2rem;
  font-weight: 400;
  line-height: 1.6rem;
  color: ${COLORS.lightGray};
  text-align: right;
  white-space: nowrap;
`;

interface BalanceCurrencyProps {
  balance: BalanceAssetExtended | BalanceNativeExtended;
  currentLumenQuote: Pick<LumenQuote, "price">;
  currentAccount: Account;
  isHidden: boolean;
}

const BalanceCurrency = ({
  balance,
  currentLumenQuote,
  currentAccount,
  isHidden,
}: BalanceCurrencyProps) => {
  if (isHidden) {
    return null;
  }
  const isNativeCurrency = currentAccount.currency.symbol === "XLM";

  // Don't show alternative balance for lumen in lumens
  if (balance.asset_type === "native" && isNativeCurrency) {
    return null;
  }

  if (!balance.nativeBalance) {
    return null;
  }

  return (
    <Container>
      {isNativeCurrency ? "" : currentAccount.currency.symbol}
      {formatCurrencyBalance(
        Number(balance.nativeBalance) * currentLumenQuote.price,
        currentAccount.currency.display_decimals,
      )}
      {isNativeCurrency ? " XLM" : ""}
    </Container>
  );
};

export default BalanceCurrency;
