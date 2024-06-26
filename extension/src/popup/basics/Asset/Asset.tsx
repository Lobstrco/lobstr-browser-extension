import * as React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { assetsInfoSelector } from "../../ducks/assets";
import { FlexAllCenter, TextEllipsis } from "../../styles/common";
import { COLORS } from "../../styles/colors";

const Container = styled.div`
  display: flex;
  align-items: center;
  width: 60%;
`;

const AssetLogo = styled.img`
  height: 2.4rem;
  width: 2.4rem;
`;

const AssetDefaultLogo = styled.div`
  height: 2.4rem;
  width: 2.4rem;
  min-width: 2.4rem;
  min-height: 2.4rem;
  border-radius: 50%;
  ${FlexAllCenter};
  background-color: ${COLORS.lightGray};
  color: ${COLORS.white};
`;

const AssetMain = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 1.2rem;
  width: 100%;
`;

const Name = styled.span`
  font-size: 1.3rem;
  font-weight: 400;
  line-height: 1.6rem;
  color: ${COLORS.darkGray};
`;

const Domain = styled.span`
  color: ${COLORS.lightGray};
  font-size: 1.2rem;
  font-weight: 400;
  line-height: 1.6rem;
  ${TextEllipsis};
`;

interface AssetProps {
  code: string;
  issuer?: string;
}

const Asset = ({ code, issuer }: AssetProps) => {
  const assets = useSelector(assetsInfoSelector);

  const assetInfo = assets.find(
    (info) => info.code === code && info.issuer === issuer,
  );

  return (
    <Container>
      {assetInfo && assetInfo.image ? (
        <AssetLogo src={assetInfo.image} alt={code} />
      ) : (
        <AssetDefaultLogo>{code.slice(0, 1)}</AssetDefaultLogo>
      )}
      <AssetMain>
        <Name>{assetInfo?.name || code}</Name>
        <Domain>
          {code} ({assetInfo?.home_domain || "unknown"})
        </Domain>
      </AssetMain>
    </Container>
  );
};

export default Asset;
