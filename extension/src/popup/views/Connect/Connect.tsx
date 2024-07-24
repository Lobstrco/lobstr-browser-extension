import * as React from "react";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode.react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Popup from "../../basics/Popup/Popup";
import {
  DescriptionStyles,
  TitleStyles,
  WrapperStyles,
} from "../../styles/common";
import { COLORS } from "../../styles/colors";

import useOnClickOutside from "../../helpers/useOutsideClick";
import {
  allAccountsSelector,
  applicationIdSelector,
  authErrorSelector,
  clearApiError,
  login,
} from "../../ducks/authService";
import { AppDispatch } from "../../App";
import { Menu, MenuItemLink } from "../../basics/Menu/Menu";
import QR from "popup/assets/icon-qr.svg";
import Logo from "popup/assets/lobstr-logo.svg";
import ArrowIcon from "popup/assets/icon-arrow-right.svg";
import Ios from "popup/assets/ios.svg";
import Android from "popup/assets/android.svg";
import BackIcon from "popup/assets/icon-back.svg";

const Wrapper = styled.div`
  ${WrapperStyles};
  padding-bottom: 0;
  flex: 1;
`;

const Title = styled.h3`
  ${TitleStyles};
  margin-top: 1.4rem;
  margin-bottom: 0.4rem;
`;

const Description = styled.span`
  ${DescriptionStyles};
  margin-bottom: 2.4rem;
`;

const Instruction = styled.span`
  ${DescriptionStyles};
`;

const Highlighted = styled.div`
  font-weight: 500;
  padding: 0.2rem 0.4rem;
  border-radius: 0.3rem;
  background-color: ${COLORS.blue}14;
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  color: ${COLORS.darkGray};
`;

const QrContainer = styled.div`
  margin: auto;
`;

const DontHaveLobstr = styled.div`
  padding: 1.6rem 2rem 1.6rem 2.4rem;
  border-top: 0.1rem solid ${COLORS.border};
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.1s linear;
  position: relative;
  margin-top: auto;

  &:hover {
    padding-right: 1.6rem;
  }
`;

const DontHaveLobstrText = styled.span`
  ${DescriptionStyles};
  margin-left: 1.2rem;
`;

const Arrow = styled.img`
  margin-left: auto;
`;

const LobstrLinks = styled(Menu)`
  right: 1.6rem;
  bottom: 1.6rem;
`;

const LobstrLink = styled(MenuItemLink)`
  img {
    margin-right: 0.8rem;
  }
`;

const BackButton = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  font-weight: 500;
`;

const Connect = () => {
  const [showLinks, setShowLinks] = useState(false);
  const [uuid, setUuid] = useState(uuidv4());

  const navigate = useNavigate();

  const dispatch: AppDispatch = useDispatch();
  const allAccounts = useSelector(allAccountsSelector);
  const applicationId = useSelector(applicationIdSelector);
  const error = useSelector(authErrorSelector);

  const ref = useRef(null);

  useOnClickOutside(ref, () => setShowLinks(false));

  useEffect(() => {
    dispatch(login(uuid));
  }, [uuid, dispatch]);

  useEffect(() => {
    if (error) {
      setUuid(uuidv4());
      dispatch(clearApiError());
    }
  }, [dispatch, error]);

  useEffect(() => {
    if (allAccounts.find(({ connectionKey }) => connectionKey === uuid)) {
      navigate(-1);
    }
  }, [uuid, allAccounts, navigate]);

  return (
    <Popup>
      <Wrapper>
        {Boolean(allAccounts.length) && (
          <BackButton onClick={() => navigate(-1)}>
            <img src={BackIcon} alt="back" />
            <span>Back</span>
          </BackButton>
        )}
        <Title>Connect your wallet</Title>
        <Description>
          Connect your Stellar wallet from the LOBSTR app to the signer
          extension
        </Description>
        <Instruction>
          1. Open the <Highlighted>LOBSTR wallet</Highlighted> app on your phone
        </Instruction>
        <Instruction>
          2. Tap{" "}
          <Highlighted>
            Scan <img src={QR} alt="QR" />
          </Highlighted>{" "}
          and scan the QR code below
        </Instruction>
        <Instruction>
          3. <Highlighted>Confirm</Highlighted> the connection request
        </Instruction>
        <QrContainer className="test_wrapper">
          <QRCode
            value={`lobstr-extension://${applicationId}/${uuid}`}
            renderAs="canvas"
            size={96}
          />
        </QrContainer>
      </Wrapper>
      <DontHaveLobstr onClick={() => setShowLinks(true)}>
        <img src={Logo} alt="Logo" />
        <DontHaveLobstrText>
          Don’t have the LOBSTR mobile app installed?{" "}
        </DontHaveLobstrText>
        <Arrow src={ArrowIcon} alt=">" />
        {showLinks && (
          <LobstrLinks ref={ref}>
            <LobstrLink
              href="https://apps.apple.com/ec/app/lobstr-stellar-lumens-wallet/id1404357892"
              target="_blank"
            >
              <img src={Ios} alt="Ios" />
              <span>Download LOBSTR app for iOS</span>
            </LobstrLink>
            <LobstrLink
              href="https://play.google.com/store/apps/details?id=com.lobstr.client&hl=en_US"
              target="_blank"
            >
              <img src={Android} alt="Android" />
              <span>Download LOBSTR app for Android</span>
            </LobstrLink>
          </LobstrLinks>
        )}
      </DontHaveLobstr>
    </Popup>
  );
};

export default Connect;
