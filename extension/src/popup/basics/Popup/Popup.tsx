import * as React from "react";
import styled from "styled-components";
import {
  POPUP_HEIGHT,
  POPUP_WIDTH,
} from "../../../background/constants/dimensions";
import { COLORS } from "../../styles/colors";

interface PopupProps {
  children: React.ReactNode;
}

const Container = styled.div`
  height: 100%;
  background-color: ${COLORS.white};
  max-height: ${POPUP_HEIGHT}px;
  min-height: ${POPUP_HEIGHT}px;
  max-width: ${POPUP_WIDTH}px;
  min-width: ${POPUP_WIDTH}px;
  width: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 0.6rem;
`;

const Popup = ({ children }: PopupProps) => <Container>{children}</Container>;

export default Popup;
