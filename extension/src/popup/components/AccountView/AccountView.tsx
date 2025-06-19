import * as React from "react";
import styled from "styled-components";
import IdentIcon from "../../basics/Identicon/IdentIcon";
import { truncatedPublicKey } from "../../helpers/stellar";
import { COLORS } from "../../styles/colors";
import { DescriptionStyles, TextEllipsis } from "../../styles/common";
import AppleDevice from "popup/assets/apple-device.svg";
import AndroidDevice from "popup/assets/android-device.svg";
import { FixedTooltip, FIXED_TOOLTIP_POSITION } from "../../basics/FixedTooltip";

interface AccountViewProps extends React.HTMLAttributes<HTMLDivElement> {
  publicKey: string;
  federation: string;
  nickname: string;
  userAgent: string;
  isNarrow?: boolean;
}

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 1.6rem;
  height: 100%;
  flex: 1;
  min-width: 0;
`;

const Details = styled.div<{ $isNarrow?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 3.6rem;
  ${DescriptionStyles};

  span {
    ${TextEllipsis};
    width: ${({ $isNarrow }) => ($isNarrow ? "15rem" : "20.8rem")};
  }

  span:first-child {
    color: ${COLORS.darkGray};
    font-weight: 500;
  }
`;

const IdentIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const DeviceIconWrapper = styled.div`
  position: absolute;
  bottom: -0.4rem;
  right: -0.8rem;
  width: 2.2rem;
  height: 2.2rem;
`;

const DeviceIcon = styled.img`
  width: 100%;
  height: 100%;
  background: var(--account-background-color, ${COLORS.white});
  border-radius: 50%;
  border: 0.2rem solid var(--account-background-color, ${COLORS.white});
  z-index: 20;
`;

const AccountView = ({
  publicKey,
  federation,
  nickname,
  userAgent,
  isNarrow,
  ...props
}: AccountViewProps) => {
  const truncated = truncatedPublicKey(publicKey);
  const firstTitle = nickname || federation || truncated;
  const secondTitle = firstTitle === truncated ? "" : truncated;
  const deviceIcon = userAgent.includes("Android")
    ? AndroidDevice
    : AppleDevice;

  return (
    <Container {...props}>
      <IdentIconWrapper>
        <IdentIcon publicKey={publicKey} />
        <DeviceIconWrapper>
          <FixedTooltip
            content={<span>{userAgent}</span>}
            position={FIXED_TOOLTIP_POSITION.bottom}
            bodyShiftXPercent={30}
            maxWidthPercent={60}
          >
            <DeviceIcon src={deviceIcon} alt="device" />
          </FixedTooltip>
        </DeviceIconWrapper>
      </IdentIconWrapper>

      <Details $isNarrow={isNarrow}>
        <span>{firstTitle}</span>
        {secondTitle && <span>{secondTitle}</span>}
      </Details>
    </Container>
  );
};

export default AccountView;
