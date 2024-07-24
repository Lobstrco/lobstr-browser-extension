import * as React from "react";
import styled from "styled-components";
import * as StellarSdk from "@stellar/stellar-sdk";
import { formatBalance } from "../../helpers/format";
import { COLORS } from "../../styles/colors";

const Container = styled.span`
  font-size: 1.3rem;
  font-weight: 400;
  line-height: 1.6rem;
  text-align: right;
  white-space: nowrap;
`;

const Hidden = styled(Container)`
  color: ${COLORS.lightGray};
`;

const Balance = ({
  balance,
  isHidden,
}: {
  balance:
    | StellarSdk.Horizon.HorizonApi.BalanceLineAsset
    | StellarSdk.Horizon.HorizonApi.BalanceLineNative;
  isHidden: boolean;
}) => {
  if (isHidden) {
    return <Hidden>***</Hidden>;
  }
  const code =
    balance.asset_type === "native"
      ? "XLM"
      : balance.asset_code.length > 6
      ? `${balance.asset_code.slice(0, 6)}...`
      : balance.asset_code;

  return (
    <Container>
      {formatBalance(Number(balance.balance), true)} {code}
    </Container>
  );
};

export default Balance;
