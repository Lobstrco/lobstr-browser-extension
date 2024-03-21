import * as React from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useRef, useState } from "react";
import Popup from "../../basics/Popup/Popup";
import {
  DescriptionStyles,
  FlexAllCenter,
  TitleStyles,
  WrapperStyles,
} from "../../styles/common";
import { allAccountsSelector, logout } from "../../ducks/authService";

import { COLORS } from "../../styles/colors";
import { ROUTES } from "../../constants/routes";
import { navigateTo } from "../../helpers/navigate";
import AccountView from "../../components/AccountView/AccountView";
import { Menu, MenuItem, MenuItemLink } from "../../basics/Menu/Menu";
import useOnClickOutside from "../../helpers/useOutsideClick";
import { AppDispatch } from "../../App";
import { List } from "../../basics/List/List";
import Dots from "popup/assets/icon-three-dots.svg";

const Wrapper = styled.div`
  ${WrapperStyles};
  padding-top: 4.8rem;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Title = styled.h3`
  ${TitleStyles};
`;

const Description = styled.span`
  ${DescriptionStyles}}
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.4rem;
`;

const WalletButton = styled.div`
  ${FlexAllCenter};
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 0.3rem;

  &:hover {
    background-color: ${COLORS.hover};
  }
`;

const WalletsList = styled(List)`
  max-height: 24rem;
`;

const Wallet = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1.2rem 0;
  position: relative;

  &:last-child {
    padding-bottom: 4rem;
  }
`;

const AddAccount = styled.div`
  display: flex;
  justify-content: space-between;
  ${DescriptionStyles};
`;

const AddAccountButton = styled.div`
  color: ${COLORS.blue};
  cursor: pointer;
`;

const StyledMenu = styled(Menu)`
  right: 0;
  top: 0;
`;

const Wallets = () => {
  const [menuKey, setMenuKey] = useState<string | null>(null);
  const allAccounts = useSelector(allAccountsSelector);
  const dispatch: AppDispatch = useDispatch();

  const ref = useRef(null);

  useOnClickOutside(ref, () => setMenuKey(null));

  useEffect(() => {
    if (!allAccounts.length) {
      navigateTo(ROUTES.welcome);
    }
  }, [allAccounts]);

  const disconnect = useCallback(
    (key: string) => {
      dispatch(logout(key));
    },
    [dispatch],
  );

  return (
    <Popup>
      <Wrapper>
        <Header>
          <div>
            <Title>Connected wallets</Title>
            <Description>Your wallets connected to extension</Description>
          </div>
        </Header>
        <WalletsList $withScroll={allAccounts.length > 3}>
          {allAccounts.map(
            ({ publicKey, federation, connectionKey, userAgent }) => (
              <Wallet key={connectionKey}>
                <AccountView
                  publicKey={publicKey}
                  federation={federation}
                  userAgent={userAgent}
                />
                <WalletButton onClick={() => setMenuKey(connectionKey)}>
                  <img src={Dots} alt="..." />
                </WalletButton>
                {menuKey === connectionKey && (
                  <StyledMenu ref={ref}>
                    <MenuItem onClick={() => disconnect(connectionKey)}>
                      Disconnect wallet
                    </MenuItem>
                    <MenuItemLink
                      target="_blank"
                      href={`https://stellar.expert/explorer/public/account/${publicKey}`}
                    >
                      View on Network Explorer
                    </MenuItemLink>
                  </StyledMenu>
                )}
              </Wallet>
            ),
          )}
        </WalletsList>
        <AddAccount>
          <span>Or you could add another wallet here</span>
          <AddAccountButton onClick={() => navigateTo(ROUTES.connect)}>
            Add New
          </AddAccountButton>
        </AddAccount>
      </Wrapper>
    </Popup>
  );
};

export default Wallets;
