import * as React from "react";
import styled from "styled-components";
import { FlexAllCenter } from "../../styles/common";
import { COLORS } from "../../styles/colors";

const WalletButton = styled.div`
  ${FlexAllCenter};
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 0.3rem;
  height: fit-content;

  &:hover {
    background-color: ${COLORS.hover};
  }
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const IconButton = ({ children, ...props }: Props) => (
  <WalletButton {...props}>{children}</WalletButton>
);

export default IconButton;
