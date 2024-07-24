import * as React from "react";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Popup from "../../basics/Popup/Popup";
import {
  DescriptionStyles,
  TitleStyles,
  WrapperStyles,
} from "../../styles/common";
import { parsedSearchParam } from "../../../helpers/urls";
import { AppDispatch } from "../../App";
import { rejectTransaction, signTransaction } from "../../ducks/access";
import { allAccountsSelector } from "../../ducks/authService";

import { COLORS } from "../../styles/colors";
import IdentIcon from "../../basics/Identicon/IdentIcon";
import { truncatedPublicKey } from "../../helpers/stellar";
import SignIcon from "popup/assets/sign.svg";

const Wrapper = styled.div`
  ${WrapperStyles};
  align-items: center;
  flex: 1;
  justify-content: center;
`;

const IconWrapper = styled.div`
  position: relative;
  width: 9.6rem;
  height: 9.6rem;
`;

const Icon = styled.img`
  width: 9.2rem;
  height: 8rem;
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translate(-50%, 0);
`;

const Loader = styled.div`
  position: relative;
  width: 9.6rem;
  height: 9.6rem;
  border-radius: 50%;
  background: linear-gradient(#00abff 0%, #fff 25%, #fff 100%);
  animation: animate 1.5s linear infinite;

  &::before {
    position: absolute;
    content: "";
    background: #fff;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 9rem;
    height: 9rem;
    border-radius: 50%;
  }

  @keyframes animate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const Title = styled.h3`
  ${TitleStyles};
  margin-bottom: 0.4rem;
  margin-top: 2.4rem;
`;

const Description = styled.span`
  ${DescriptionStyles};
  text-align: center;
`;

const AccountBlock = styled.div`
  margin-top: auto;
  border-top: 0.1rem solid ${COLORS.border};
  padding: 1.6rem;
  display: flex;
  align-items: center;
  ${DescriptionStyles};

  span:first-child {
    color: ${COLORS.darkGray};
    font-weight: 500;
  }
`;

const AccountInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 0.8rem;
`;

const SendTransaction = () => {
  const location = useLocation();

  const dispatch: AppDispatch = useDispatch();

  const { connectionKey } = parsedSearchParam(location.search);

  const allAccounts = useSelector(allAccountsSelector);

  const account = useMemo(
    () => allAccounts.find(({ connectionKey: key }) => key === connectionKey),
    [allAccounts, connectionKey],
  );

  const sign = useCallback(async () => {
    await dispatch(signTransaction());
    window.close();
  }, [dispatch]);

  const reject = useCallback(async () => {
    await dispatch(rejectTransaction());
    window.close();
  }, [dispatch]);

  useEffect(() => {
    if (!account) {
      reject();
      return;
    }
    sign();
  }, [sign, reject, account]);

  return (
    <Popup>
      <Wrapper>
        <IconWrapper>
          <Loader />
          <Icon src={SignIcon} alt="sign" />
        </IconWrapper>

        <Title>Continue in LOBSTR app</Title>
        <Description>
          We've sent a signature request
          <br />
          to the LOBSTR app on your phone.
          <br />
          Review the details and confirm to sign the transaction.
        </Description>
      </Wrapper>
      <AccountBlock>
        <IdentIcon publicKey={account?.publicKey || ""} />
        <AccountInfo>
          <span>
            {account?.federation ||
              truncatedPublicKey(account?.publicKey || "")}
          </span>
          <span>Waiting for confirmation</span>
        </AccountInfo>
      </AccountBlock>
    </Popup>
  );
};

export default SendTransaction;
