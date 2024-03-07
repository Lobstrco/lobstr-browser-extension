import * as React from "react";
import styled from "styled-components";
import IdentIcon from "../../basics/Identicon/IdentIcon";
import { truncatedPublicKey } from "../../helpers/stellar";
import { COLORS } from "../../styles/colors";
import { DescriptionStyles, TextEllipsis } from "../../styles/common";

interface AccountViewProps {
  publicKey: string;
  federation: string;
  userAgent: string;
}

const Container = styled.div`
  display: flex;
  gap: 1.2rem;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  ${DescriptionStyles};

  span {
    ${TextEllipsis};
    width: 20.8rem;
  }

  span:first-child {
    color: ${COLORS.darkGray};
  }
`;

const AccountView = ({
  publicKey,
  federation,
  userAgent,
}: AccountViewProps) => {
  const truncated = truncatedPublicKey(publicKey);

  return (
    <Container>
      <IdentIcon publicKey={publicKey} />
      <Details>
        <span>{federation || truncated}</span>
        <span>{userAgent}</span>
      </Details>
    </Container>
  );
};

export default AccountView;
