import * as React from "react";
import styled from "styled-components";
import Popup from "../../basics/Popup/Popup";
import { FlexAllCenter, WrapperStyles } from "../../styles/common";
import Loader from "../../basics/Loader/Loader";

const Wrapper = styled.div`
  ${WrapperStyles};
  ${FlexAllCenter};
  flex: 1;
`;

const Loading = () => (
  <Popup>
    <Wrapper>
      <Loader />
    </Wrapper>
  </Popup>
);

export default Loading;
