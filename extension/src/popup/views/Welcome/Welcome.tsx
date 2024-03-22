import * as React from "react";
import styled from "styled-components";
import Popup from "../../basics/Popup/Popup";

import {
  DescriptionStyles,
  TitleStyles,
  WrapperStyles,
} from "../../styles/common";
import Button from "../../basics/Button/Button";
import { ROUTES } from "../../constants/routes";
import { navigateTo } from "../../helpers/navigate";
import Onboarding from "popup/assets/onboarding.svg";

const Image = styled.img`
  margin: 4.8rem auto 0;
  width: 14.8rem;
`;

const Wrapper = styled.div`
  ${WrapperStyles};
  height: 100%;
`;

const Title = styled.h3`
  ${TitleStyles};
  margin-top: 2.4rem;
  white-space: nowrap;
`;

const Description = styled.div`
  ${DescriptionStyles};
  margin-top: 0.8rem;
  text-align: center;
  margin-bottom: auto;
`;

const Welcome = () => (
  <Popup>
    <Wrapper>
      <Image src={Onboarding} alt="Onboarding" />
      <Title>Welcome to LOBSTR extension</Title>
      <Description>
        Securely connect to decentralized services on the Stellar network and
        sign transactions
        <br />
        with your LOBSTR wallet.
      </Description>
      <Button fullWidth onClick={() => navigateTo(ROUTES.connect)}>
        Get Started
      </Button>
    </Wrapper>
  </Popup>
);

export default Welcome;
