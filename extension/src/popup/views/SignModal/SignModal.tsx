import * as React from "react";
import styled from "styled-components";
import browser from "webextension-polyfill";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Popup from "../../basics/Popup/Popup";
import {
  DescriptionStyles,
  TextEllipsis,
  TitleStyles,
  WrapperStyles,
} from "../../styles/common";
import { allAccountsSelector } from "../../ducks/authService";

import { COLORS } from "../../styles/colors";
import IdentIcon from "../../basics/Identicon/IdentIcon";
import { truncatedPublicKey } from "../../helpers/stellar";
import SignIcon from "popup/assets/sign.svg";
import { loadSignPromptState } from "@shared/api/internal";
import { SERVICE_TYPES } from "@shared/constants/services";
import { SignPromptState } from "@shared/constants/mesagesData.types";

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

const Counts = styled.span`
  ${DescriptionStyles};
  text-align: center;
  padding: 0.8rem 0;
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
  width: 100%;

  span {
    width: 90%;
    ${TextEllipsis};
  }
`;

const plural = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? "" : "s"}`;

const SignModal = () => {
  const [promptState, setPromptState] = useState<SignPromptState>({
    requests: [],
    signed: 0,
  });

  const allAccounts = useSelector(allAccountsSelector);

  // the head of the queue is the one the wallet is showing right now
  const [currentRequest] = promptState.requests;
  const waiting = promptState.requests.length;
  // sticky once a second request joins: signed never falls, the queue empties at close
  const showCounts = promptState.signed + waiting > 1;

  const account = useMemo(
    () =>
      allAccounts.find(
        ({ connectionKey }) => connectionKey === currentRequest?.connectionKey,
      ),
    [allAccounts, currentRequest],
  );

  useEffect(() => {
    // the background closes this window itself; these are the fallbacks for when
    // it cannot — a restarted worker has no record of the queue, a dead one no reply
    const refresh = () =>
      loadSignPromptState().then(
        (state) => {
          setPromptState(state);
          if (!state.requests.length) {
            window.close();
          }
        },
        () => window.close(),
      );
    refresh();
    // the background announces changes; the call above covers what we missed
    const listener = (message: { type?: string }) => {
      if (message?.type === SERVICE_TYPES.SIGN_PROMPT_STATE_CHANGED) {
        refresh();
      }
    };
    browser.runtime.onMessage.addListener(listener);
    return () => browser.runtime.onMessage.removeListener(listener);
  }, []);

  const accountName = useMemo(
    () =>
      account?.nickname ||
      account?.federation ||
      truncatedPublicKey(account?.publicKey || ""),
    [account],
  );

  return (
    <Popup>
      <Wrapper>
        <IconWrapper>
          <Loader />
          <Icon src={SignIcon} alt="sign" />
        </IconWrapper>

        <Title>Continue in LOBSTR app</Title>
        {showCounts && (
          <Counts>
            {promptState.signed > 0 &&
              `${plural(promptState.signed, "request")} signed · `}
            {plural(waiting, "request")} waiting
          </Counts>
        )}
        <Description>
          We've sent a signature request
          <br />
          to the LOBSTR app on your phone.
          <br />
          Review the details and confirm to sign the{" "}
          {currentRequest?.signType || "transaction"}.
        </Description>
      </Wrapper>
      <AccountBlock>
        <IdentIcon publicKey={account?.publicKey || ""} />
        <AccountInfo>
          <span>{accountName}</span>
          <span>Waiting for confirmation</span>
        </AccountInfo>
      </AccountBlock>
    </Popup>
  );
};

export default SignModal;
