import * as React from "react";
import createStellarIdenticon from "stellar-identicon-js";
import styled from "styled-components";
import { FlexAllCenter } from "../../styles/common";
import { COLORS } from "../../styles/colors";

interface IdentIconProps {
  publicKey: string;
}

const Container = styled.div`
  ${FlexAllCenter};
  height: 3.2rem;
  width: 3.2rem;
  min-width: 3.2rem;
  min-height: 3.2rem;
  border-radius: 50%;
  background-color: var(--identicon-background-color, ${COLORS.hover});
`;

const Icon = styled.img`
  height: 1.6rem;
  width: 1.6rem;
`;

const IdentIcon = ({ publicKey }: IdentIconProps) => (
  <Container className="identicon">
    <Icon src={createStellarIdenticon(publicKey).toDataURL()} alt="identicon" />
  </Container>
);

export default IdentIcon;
