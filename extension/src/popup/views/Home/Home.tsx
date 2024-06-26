import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as StellarSdk from "@stellar/stellar-sdk";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { HORIZON_URL } from "@shared/constants/stellar";
import { getAssetsNativePrices, getLumenQuotes } from "@shared/api/internal";
import { LumenQuote, NativePrice } from "@shared/constants/types";
import { TextEllipsis, WrapperStyles } from "../../styles/common";
import Popup from "../../basics/Popup/Popup";
import {
  allAccountsSelector,
  isHiddenModeSelector,
  logout,
  selectedConnectionSelector,
  toggleHiddenMode,
} from "../../ducks/authService";
import { navigateTo } from "../../helpers/navigate";
import { ROUTES } from "../../constants/routes";
import AccountView from "../../components/AccountView/AccountView";
import IconButton from "../../basics/IconButton/IconButton";
import { COLORS } from "../../styles/colors";
import useOnClickOutside from "../../helpers/useOutsideClick";
import { AppDispatch } from "../../App";
import { Menu, MenuItem, MenuItemLink } from "../../basics/Menu/Menu";
import { processNew } from "../../ducks/assets";
import Loading from "../../components/Loading/Loading";
import Asset from "../../basics/Asset/Asset";
import { List } from "../../basics/List/List";
import { formatBalance, formatCurrencyBalance } from "../../helpers/format";
import Tooltip, { TOOLTIP_POSITION } from "../../basics/Tooltip/Tooltip";
import Copy from "popup/assets/icon-copy.svg";
import Dots from "popup/assets/icon-three-dots.svg";
import Down from "popup/assets/icon-arrow-down.svg";
import Eye from "popup/assets/icon-eye.svg";
import EyeCrossed from "popup/assets/icon-eye-crossed.svg";

const Wrapper = styled.div`
  ${WrapperStyles};
  padding-top: 1.6rem;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  gap: 0.8rem;
  position: relative;
`;

const StyledIconButton = styled(IconButton)`
  margin-left: auto;
`;

const HeaderButton = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 0.3rem;

  &:hover {
    background-color: ${COLORS.hover};
  }
`;

const StyledMenu = styled(Menu)`
  right: 0;
  top: 0;
`;

const TotalBalanceBlock = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0.8rem 2.4rem 1.6rem;
  border-bottom: 0.1rem solid ${COLORS.border};
`;

const TotalBalance = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  span:first-child {
    font-size: 2.1rem;
    font-weight: 500;
  }

  span:last-child {
    font-size: 1.2rem;
    line-height: 1.8rem;
    color: ${COLORS.lightGray};
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
`;

const ToggleHiddenModeButton = styled.img`
  cursor: pointer;
`;

const AddAccountButton = styled.div`
  color: ${COLORS.blue};
  cursor: pointer;
`;

const BalancesList = styled(List)`
  max-height: 26rem;
`;

const BalanceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 0;
`;

const BalanceColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 40%;
`;

const Balance = styled.span`
  font-size: 1.3rem;
  font-weight: 400;
  line-height: 1.6rem;
  text-align: right;
  ${TextEllipsis};
`;

const BalanceCurrency = styled.span`
  font-size: 1.2rem;
  font-weight: 400;
  line-height: 1.6rem;
  color: ${COLORS.lightGray};
  text-align: right;
`;

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShowTooltip, setIsShowTooltip] = useState(false);
  const [balances, setBalances] = useState<
    | (
        | StellarSdk.Horizon.HorizonApi.BalanceLineAsset
        | StellarSdk.Horizon.HorizonApi.BalanceLineNative
      )[]
    | null
  >(null);

  const [nativePrices, setNativePrices] = useState<NativePrice[] | null>(null);
  const [lumenQuotes, setLumenQuotes] = useState<LumenQuote[] | null>(null);

  const server = useMemo(() => new StellarSdk.Horizon.Server(HORIZON_URL), []);

  const allAccounts = useSelector(allAccountsSelector);
  const isHiddenMode = useSelector(isHiddenModeSelector);
  const selectedConnection = useSelector(selectedConnectionSelector);

  const dispatch: AppDispatch = useDispatch();

  const toggle = () => {
    dispatch(toggleHiddenMode());
  };

  useEffect(() => {
    if (!allAccounts.length) {
      navigateTo(ROUTES.welcome);
    }
  }, [allAccounts]);

  const menuRef = useRef(null);
  useOnClickOutside(menuRef, () => setIsMenuOpen(false));

  const currentAccount = useMemo(
    () => allAccounts.find((acc) => acc.connectionKey === selectedConnection),
    [allAccounts, selectedConnection],
  );

  useEffect(() => {
    if (!currentAccount) {
      return;
    }
    const closeStream = server
      .accounts()
      .accountId(currentAccount!.publicKey)
      .stream({
        onmessage: (res) => {
          const filteredBalances = res.balances.filter(
            (
              balance,
            ): balance is
              | StellarSdk.Horizon.HorizonApi.BalanceLineAsset
              | StellarSdk.Horizon.HorizonApi.BalanceLineNative =>
              balance.asset_type === "native" ||
              balance.asset_type === "credit_alphanum4" ||
              balance.asset_type === "credit_alphanum12",
          );
          setBalances(filteredBalances);
          const newAssets = filteredBalances.map((balance) =>
            balance.asset_type === "native"
              ? StellarSdk.Asset.native()
              : new StellarSdk.Asset(balance.asset_code, balance.asset_issuer),
          );
          dispatch(processNew(newAssets));
          getAssetsNativePrices(newAssets).then((result) => {
            setNativePrices(result);
          });
        },
        onerror: () => {
          setBalances([
            {
              asset_type: "native",
              balance: "0",
              buying_liabilities: "0",
              selling_liabilities: "0",
            },
          ]);
          setNativePrices([]);
        },
      });

    return () => closeStream();
  }, [currentAccount, dispatch, server]);

  useEffect(() => {
    getLumenQuotes().then(({ quotes }) => {
      setLumenQuotes(quotes);
    });
  }, [balances]);

  const disconnect = useCallback(
    (key: string) => {
      dispatch(logout(key));
    },
    [dispatch],
  );

  const currentLumenQuote = useMemo(() => {
    if (!lumenQuotes || !currentAccount) {
      return null;
    }
    if (currentAccount?.currency.code === "XLM") {
      return {
        price: 1,
      };
    }
    return lumenQuotes.find(
      (quote) => quote.currency === currentAccount?.currency.code,
    );
  }, [lumenQuotes, currentAccount]);

  const sortedBalances:
    | (
        | (StellarSdk.Horizon.HorizonApi.BalanceLineAsset & {
            nativeBalance: number;
          })
        | (StellarSdk.Horizon.HorizonApi.BalanceLineNative & {
            nativeBalance: number;
          })
      )[]
    | null = useMemo(() => {
    if (!nativePrices || !balances) {
      return null;
    }
    const [native, ...rest] = [...balances].reverse().map((balance) => {
      const nativePrice: number =
        balance.asset_type === "native"
          ? 1
          : Number(
              nativePrices.find(
                (price) =>
                  price.asset_code === balance.asset_code &&
                  price.asset_issuer === balance.asset_issuer,
              )?.close_native_price ?? 0,
            );
      return { ...balance, nativeBalance: +balance.balance * nativePrice };
    });
    return [
      native,
      ...(
        rest as (StellarSdk.Horizon.HorizonApi.BalanceLineAsset & {
          nativeBalance: number;
        })[]
      ).sort(
        (a, b) =>
          b.nativeBalance - a.nativeBalance ||
          +b.balance - +a.balance ||
          a.asset_code.localeCompare(b.asset_code),
      ),
    ];
  }, [nativePrices, balances]);

  const totalBalance = useMemo(() => {
    if (!sortedBalances) {
      return 0;
    }
    return sortedBalances.reduce((acc, balance) => {
      acc += balance.nativeBalance;
      return acc;
    }, 0);
  }, [sortedBalances]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsShowTooltip(true);

      setTimeout(() => {
        setIsShowTooltip(false);
      }, 3000);
    });
  };

  if (!currentAccount || !sortedBalances || !currentLumenQuote!) {
    return <Loading />;
  }

  return (
    <Popup>
      <Wrapper>
        <Header>
          <HeaderButton onClick={() => navigateTo(ROUTES.wallets)}>
            <AccountView
              publicKey={currentAccount!.publicKey}
              federation={currentAccount!.federation}
              userAgent={currentAccount!.userAgent}
              isNarrow
            />
            <img src={Down} alt="open wallets" />
          </HeaderButton>

          <Tooltip
            content={<span>Copied</span>}
            position={TOOLTIP_POSITION.bottom}
            isShow={isShowTooltip}
          >
            <StyledIconButton
              onClick={() => copyToClipboard(currentAccount!.publicKey)}
            >
              <img src={Copy} alt="copy" />
            </StyledIconButton>
          </Tooltip>

          <IconButton onClick={() => setIsMenuOpen(true)}>
            <img src={Dots} alt="..." />
          </IconButton>
          {isMenuOpen && (
            <StyledMenu ref={menuRef}>
              <MenuItem
                onClick={() => disconnect(currentAccount!.connectionKey)}
              >
                Remove connection
              </MenuItem>
              <MenuItemLink
                target="_blank"
                href={`https://stellar.expert/explorer/public/account/${
                  currentAccount!.publicKey
                }`}
              >
                View on Network Explorer
              </MenuItemLink>
            </StyledMenu>
          )}
        </Header>
      </Wrapper>
      <TotalBalanceBlock>
        <TotalBalance>
          <span>
            {isHiddenMode
              ? "***"
              : `${currentAccount.currency.symbol}${formatCurrencyBalance(
                  totalBalance * currentLumenQuote.price,
                  currentAccount.currency.display_decimals,
                )}`}
          </span>
          <span>
            Your total balance
            <ToggleHiddenModeButton
              src={isHiddenMode ? Eye : EyeCrossed}
              alt="show"
              onClick={() => toggle()}
            />
          </span>
        </TotalBalance>
        <AddAccountButton onClick={() => navigateTo(ROUTES.connect)}>
          Add Wallet
        </AddAccountButton>
      </TotalBalanceBlock>
      <Wrapper>
        <BalancesList $withScroll={Boolean(balances && balances?.length > 4)}>
          {sortedBalances?.map((balance) => (
            <BalanceRow
              key={
                balance.asset_type === "native"
                  ? "native"
                  : balance.asset_code + balance.asset_issuer
              }
            >
              <Asset
                code={
                  balance.asset_type === "native" ? "XLM" : balance.asset_code
                }
                issuer={
                  balance.asset_type === "native"
                    ? undefined
                    : balance.asset_issuer
                }
              />
              <BalanceColumn>
                {isHiddenMode ? (
                  <BalanceCurrency>***</BalanceCurrency>
                ) : (
                  <>
                    <Balance>
                      {formatBalance(+balance.balance, true)}{" "}
                      {balance.asset_type === "native"
                        ? "XLM"
                        : balance.asset_code}
                    </Balance>
                    <BalanceCurrency>
                      {currentAccount.currency.symbol}
                      {formatCurrencyBalance(
                        +balance.nativeBalance * currentLumenQuote.price,
                        currentAccount.currency.display_decimals,
                      )}
                    </BalanceCurrency>
                  </>
                )}
              </BalanceColumn>
            </BalanceRow>
          ))}
        </BalancesList>
      </Wrapper>
    </Popup>
  );
};

export default Home;
