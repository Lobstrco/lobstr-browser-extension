import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as StellarSdk from "@stellar/stellar-sdk";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { HORIZON_URL } from "@shared/constants/stellar";
import { getLumenQuotes, getPricesCollection } from "@shared/api/internal";
import { BalanceAssetExtended, BalanceNativeExtended, LumenQuote } from "@shared/constants/types";
import { WrapperStyles } from "../../styles/common";
import Popup from "../../basics/Popup/Popup";
import {
  allAccountsSelector,
  isHiddenModeSelector,
  logout,
  selectedConnectionSelector,
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
import Tooltip, { TOOLTIP_POSITION } from "../../basics/Tooltip/Tooltip";
import Balance from "../../components/Balance/Balance";
import BalanceCurrency from "../../components/BalanceCurrency/BalanceCurrency";
import TotalBalance from "../../components/TotalBalance/TotalBalance";
import Copy from "popup/assets/icon-copy.svg";
import Dots from "popup/assets/icon-three-dots.svg";
import Down from "popup/assets/icon-arrow-down.svg";

const Wrapper = styled.div`
  ${WrapperStyles};
  padding-top: 1.6rem;
  display: flex;
  flex-direction: column;
`;

const HeaderWrapper = styled(Wrapper)`
  padding-right: 1.6rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const StyledTooltip = styled(Tooltip)`
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

const BalancesList = styled(List)`
  max-height: 25rem;
`;

const BalanceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 0;
  gap: 4rem;
`;

const BalanceColumn = styled.div`
  display: flex;
  flex-direction: column;
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

  const [nativePrices, setNativePrices] = useState<Map<string, number> | null>(null);
  const [lumenQuotes, setLumenQuotes] = useState<LumenQuote[] | null>(null);

  const server = useMemo(() => new StellarSdk.Horizon.Server(HORIZON_URL), []);

  const allAccounts = useSelector(allAccountsSelector);
  const isHiddenMode = useSelector(isHiddenModeSelector);
  const selectedConnection = useSelector(selectedConnectionSelector);

  const dispatch: AppDispatch = useDispatch();

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
          getPricesCollection(newAssets).then((result: Map<string, number>) => {
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
          setNativePrices(new Map());
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

  const currentLumenQuote: Pick<LumenQuote, "price"> | null = useMemo(() => {
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
    ) as LumenQuote;
  }, [lumenQuotes, currentAccount]);

  const sortedBalances:
    | (BalanceAssetExtended | BalanceNativeExtended)[]
    | null = useMemo(() => {
    if (!nativePrices || !balances) {
      return null;
    }
    const [native, ...rest] = [...balances].reverse().map((balance: any) => {
      const assetKey: string = `${balance.asset_code}:${balance.asset_issuer}`;
      const nativePrice: number =
        balance.asset_type === "native"
          ? 1
          : nativePrices.get(assetKey) ?? 0;
      return { ...balance, nativeBalance: +balance.balance * nativePrice };
    });
    return [
      native as BalanceNativeExtended,
      ...(rest as BalanceAssetExtended[]).sort(
        (a, b) =>
          b.nativeBalance - a.nativeBalance ||
          +b.balance - +a.balance ||
          a.asset_code.localeCompare(b.asset_code),
      ),
    ];
  }, [nativePrices, balances]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsShowTooltip(true);

      setTimeout(() => {
        setIsShowTooltip(false);
      }, 3000);
    });
  };

  console.log(currentAccount, sortedBalances, currentLumenQuote);

  if (!currentAccount || !sortedBalances || !currentLumenQuote!) {
    return <Loading />;
  }

  return (
    <Popup>
      <HeaderWrapper>
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

          <StyledTooltip
            content={<span>Copied</span>}
            position={TOOLTIP_POSITION.bottom}
            isShow={isShowTooltip}
          >
            <IconButton
              onClick={() => copyToClipboard(currentAccount!.publicKey)}
            >
              <img src={Copy} alt="copy" />
            </IconButton>
          </StyledTooltip>

          <IconButton onClick={() => setIsMenuOpen(true)}>
            <img src={Dots} alt="..." />
          </IconButton>
          {isMenuOpen && (
            <StyledMenu ref={menuRef}>
              <MenuItem onClick={() => navigateTo(ROUTES.connect)}>
                Add wallet
              </MenuItem>
              <MenuItemLink
                target="_blank"
                href={`https://stellar.expert/explorer/public/account/${
                  currentAccount!.publicKey
                }`}
              >
                View on Network Explorer
              </MenuItemLink>
              <MenuItem
                onClick={() => disconnect(currentAccount!.connectionKey)}
              >
                Remove connection
              </MenuItem>
            </StyledMenu>
          )}
        </Header>
      </HeaderWrapper>
      <TotalBalance
        sortedBalances={sortedBalances}
        isHiddenMode={isHiddenMode}
        currentAccount={currentAccount}
        currentLumenQuote={currentLumenQuote}
      />
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
                <Balance balance={balance} isHidden={isHiddenMode} />
                <BalanceCurrency
                  balance={balance}
                  currentLumenQuote={currentLumenQuote}
                  currentAccount={currentAccount}
                  isHidden={isHiddenMode}
                />
              </BalanceColumn>
            </BalanceRow>
          ))}
        </BalancesList>
      </Wrapper>
    </Popup>
  );
};

export default Home;
