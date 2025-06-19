import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import Popup from "../../basics/Popup/Popup";
import {
  DescriptionStyles,
  TitleStyles,
  WrapperStyles,
} from "../../styles/common";
import {
  allAccountsSelector,
  logout,
  selectConnection,
} from "../../ducks/authService";

import { COLORS } from "../../styles/colors";
import { ROUTES } from "../../constants/routes";
import { navigateTo } from "../../helpers/navigate";
import AccountView from "../../components/AccountView/AccountView";
import { Menu, MenuItem, MenuItemLink } from "../../basics/Menu/Menu";
import useOnClickOutside from "../../helpers/useOutsideClick";
import { AppDispatch } from "../../App";
import { List } from "../../basics/List/List";
import IconButton from "../../basics/IconButton/IconButton";
import BackIcon from "../../assets/icon-back.svg";
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

const WalletsList = styled(List)`
  max-height: 22rem;
`;

const Wallet = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  align-items: center;

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

const AccountViewStyled = styled(AccountView)`
  height: 5.8rem;
  padding: 1.2rem 0.8rem;
  cursor: pointer;
  border-radius: 0.6rem;
  flex: 1;
  min-width: 0;

  &:hover {
    background-color: ${COLORS.hover};
    --account-background-color: ${COLORS.hover};
    --identicon-background-color: ${COLORS.white};
  }
`;

const BackButton = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  margin-bottom: 2.4rem;
  font-weight: 500;
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

  const chooseCurrentWallet = (key: string) => {
    dispatch(selectConnection(key)).finally(() => navigateTo(ROUTES.home));
  };

  return (
    <Popup>
      <Wrapper>
        <BackButton onClick={() => navigateTo(ROUTES.home)}>
          <img src={BackIcon} alt="back" />
          <span>Back</span>
        </BackButton>
        <Header>
          <div>
            <Title>Connected wallets</Title>
            <Description>
              Your Stellar wallets connected to the extension
            </Description>
          </div>
        </Header>
        <WalletsList $withScroll={allAccounts.length > 3}>
          {allAccounts.map(
            ({ publicKey, federation, nickname, connectionKey, userAgent }) => (
              <Wallet key={connectionKey}>
                <AccountViewStyled
                  publicKey={publicKey}
                  federation={federation}
                  nickname={nickname}
                  userAgent={userAgent}
                  onClick={() => chooseCurrentWallet(connectionKey)}
                />
                <IconButton onClick={() => setMenuKey(connectionKey)}>
                  <img src={Dots} alt="..." />
                </IconButton>
                {menuKey === connectionKey && (
                  <StyledMenu ref={ref}>
                    <MenuItem onClick={() => disconnect(connectionKey)}>
                      Remove connection
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
          <span>Connect additional wallets here</span>
          <AddAccountButton onClick={() => navigateTo(ROUTES.connect)}>
            Add Wallet
          </AddAccountButton>
        </AddAccount>
      </Wrapper>
    </Popup>
  );
};

export default Wallets;
