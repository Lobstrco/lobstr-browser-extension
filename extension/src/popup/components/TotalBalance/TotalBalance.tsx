import * as React from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { useMemo } from "react";
import {
  Account,
  BalanceAssetExtended,
  BalanceNativeExtended,
  LumenQuote,
} from "@shared/constants/types";
import { formatCurrencyBalance } from "../../helpers/format";
import { COLORS } from "../../styles/colors";
import Eye from "../../assets/icon-eye.svg";
import EyeCrossed from "../../assets/icon-eye-crossed.svg";
import { toggleHiddenMode } from "../../ducks/authService";
import { AppDispatch } from "../../App";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.8rem 2.4rem 1.6rem;
  border-bottom: 0.1rem solid ${COLORS.border};
  gap: 0.4rem;
  cursor: pointer;
`;

const Balance = styled.div`
  display: flex;
  font-size: 2.1rem;
  font-weight: 500;
  gap: 0.4rem;
`;

const Switcher = styled.div`
  font-size: 1.2rem;
  line-height: 1.8rem;
  color: ${COLORS.lightGray};
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

interface TotalBalanceProps {
  sortedBalances: (BalanceNativeExtended | BalanceAssetExtended)[];
  isHiddenMode: boolean;
  currentAccount: Account;
  currentLumenQuote: Pick<LumenQuote, "price">;
}
const TotalBalance = ({
  sortedBalances,
  isHiddenMode,
  currentAccount,
  currentLumenQuote,
}: TotalBalanceProps) => {
  const dispatch: AppDispatch = useDispatch();

  const totalBalance = useMemo(() => {
    if (!sortedBalances) {
      return 0;
    }
    return sortedBalances.reduce((acc, balance) => {
      acc += balance.nativeBalance;
      return acc;
    }, 0);
  }, [sortedBalances]);

  const toggle = () => {
    dispatch(toggleHiddenMode());
  };

  const isNativeCurrency = currentAccount.currency.symbol === "XLM";

  return (
    <Container onClick={() => toggle()}>
      <Balance>
        {isHiddenMode
          ? "***"
          : `${
              isNativeCurrency ? "" : currentAccount.currency.symbol
            }${formatCurrencyBalance(
              totalBalance * currentLumenQuote.price,
              currentAccount.currency.display_decimals,
            )}${isNativeCurrency ? " XLM" : ""}`}
      </Balance>
      <Switcher>
        Estimated portfolio value
        <img src={isHiddenMode ? Eye : EyeCrossed} alt="show" />
      </Switcher>
    </Container>
  );
};

export default TotalBalance;
