import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { getUrlHostname, parsedSearchParam } from "../../../helpers/urls";
import { getSiteFavicon } from "../../helpers/getSiteFavicon";
import Popup from "../../basics/Popup/Popup";
import {
  DescriptionStyles,
  FlexAllCenter,
  TextEllipsis,
  TitleStyles,
  WrapperStyles,
} from "../../styles/common";
import { COLORS } from "../../styles/colors";

import { navigateTo } from "../../helpers/navigate";
import { ROUTES } from "../../constants/routes";
import { List } from "../../basics/List/List";
import { allAccountsSelector } from "../../ducks/authService";
import AccountView from "../../components/AccountView/AccountView";
import Button from "../../basics/Button/Button";
import { AppDispatch } from "../../App";
import Lobstr from "popup/assets/lobstr-logo.svg";
import CheckIcon from "popup/assets/icon-checked.svg";
import { grantAccess, rejectAccess } from "popup/ducks/access";

const Wrapper = styled.div`
  ${WrapperStyles};
`;

const Icons = styled.div`
  ${FlexAllCenter};
  gap: 0.8rem;
  margin: 1.6rem 0 1.2rem;
`;

const IconWrapper = styled.div`
  ${FlexAllCenter};
  height: 4.8rem;
  width: 4.8rem;
  background-color: ${COLORS.hover};
  border-radius: 50%;
`;

const DashedLine = styled.div`
  border-top: 0.3rem dashed ${COLORS.hover};
  width: 3.2rem;
  height: 0;
`;

const TitleBlock = styled.div`
  ${FlexAllCenter};
  flex-direction: column;
  margin-bottom: 2rem;
`;

const Title = styled.h3`
  ${TitleStyles};
`;

const Domain = styled.span`
  width: 100%;
  ${DescriptionStyles};
  ${TextEllipsis};
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 0.1rem solid ${COLORS.border};
  padding: 0.8rem 2.4rem;
  ${DescriptionStyles};
`;

const AddAccountButton = styled.div`
  color: ${COLORS.blue};
  cursor: pointer;
`;

const WalletsList = styled(List)`
  max-height: 12rem;
`;

const Wallet = styled.div<{ selected: boolean }>`
  display: flex;
  cursor: pointer;
  padding: 1.2rem 0.8rem;
  border-radius: 0.6rem;
  background-color: ${({ selected }) =>
    selected ? COLORS.hover : COLORS.white};
  justify-content: space-between;
  gap: 1.2rem;

  .identicon {
    background-color: ${({ selected }) =>
      selected ? COLORS.white : COLORS.hover};
  }

  &:hover {
    background-color: ${COLORS.hover};

    .identicon {
      background-color: ${COLORS.white};
    }
  }
`;

const Buttons = styled.div`
  margin-top: auto;
  display: flex;
  gap: 0.9rem;
  padding: 0 2.4rem 1.6rem;
`;

const GrantAccess = () => {
  const location = useLocation();

  const dispatch: AppDispatch = useDispatch();
  const allAccounts = useSelector(allAccountsSelector);

  const { url } = parsedSearchParam(location.search);

  const domain = getUrlHostname(url);
  const favicon = getSiteFavicon(url);

  const sortedAccounts = useMemo(() => {
    if (!allAccounts.length) {
      return [];
    }
    return [...allAccounts].sort(
      (a, b) => b.lastActivityTime - a.lastActivityTime,
    );
  }, [allAccounts]);

  const [selectedWalletKey, setSelectedWalletKey] = useState<string | null>(
    sortedAccounts.length ? sortedAccounts[0].connectionKey : null,
  );

  useEffect(() => {
    if (!allAccounts.length) {
      navigateTo(ROUTES.connect);
    }
  }, [allAccounts]);

  const rejectAndClose = () => {
    dispatch(rejectAccess());
    window.close();
  };

  const grantAndClose = async () => {
    if (!selectedWalletKey) {
      return;
    }
    const { publicKey } = allAccounts.find(
      ({ connectionKey }) => connectionKey === selectedWalletKey,
    )!;
    await dispatch(
      grantAccess({ url, publicKey, connectionKey: selectedWalletKey }),
    );
    window.close();
  };

  return (
    <Popup>
      <Wrapper>
        <Icons>
          <IconWrapper>
            <img src={Lobstr} alt="lobstr" />
          </IconWrapper>
          <DashedLine />
          <IconWrapper>
            <img src={favicon} alt={domain} height={24} width={24} />
          </IconWrapper>
        </Icons>
        <TitleBlock>
          <Title>Connection request</Title>
          <Domain>{domain}</Domain>
        </TitleBlock>
      </Wrapper>
      <ListHeader>
        <span>Choose a wallet to use with this website</span>
        <AddAccountButton onClick={() => navigateTo(ROUTES.connect)}>
          Connect Wallet
        </AddAccountButton>
      </ListHeader>
      <Wrapper>
        <WalletsList $withScroll={sortedAccounts.length > 2}>
          {sortedAccounts.map(
            ({ publicKey, federation, connectionKey, userAgent }) => (
              <Wallet
                key={connectionKey}
                onClick={() => setSelectedWalletKey(connectionKey)}
                selected={connectionKey === selectedWalletKey}
              >
                <AccountView
                  publicKey={publicKey}
                  federation={federation}
                  userAgent={userAgent}
                />
                {connectionKey === selectedWalletKey && (
                  <img src={CheckIcon} alt="checked" />
                )}
              </Wallet>
            ),
          )}
        </WalletsList>
      </Wrapper>
      <Buttons>
        <Button fullWidth isCancel onClick={() => rejectAndClose()}>
          Reject
        </Button>
        <Button
          fullWidth
          disabled={!selectedWalletKey}
          onClick={() => grantAndClose()}
        >
          Connect
        </Button>
      </Buttons>
    </Popup>
  );
};

export default GrantAccess;
