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
`;

const Title = styled.h3`
  ${TitleStyles};
  margin-top: 2.4rem;
`;

const Description = styled.span`
  ${DescriptionStyles};
  margin-top: 0.8rem;
  text-align: center;
  margin-bottom: 6.5rem;
`;

const Welcome = () => (
  <Popup>
    <Wrapper>
      <Image src={Onboarding} alt="Onboarding" />
      <Title>Welcome to LOBSTR Extension</Title>
      <Description>
        Connect your LOBSTR Wallet mobile app
        <br /> to interact with various dApps and services
      </Description>
      <Button fullWidth onClick={() => navigateTo(ROUTES.connect)}>
        Get Started
      </Button>
    </Wrapper>
  </Popup>
);

export default Welcome;
