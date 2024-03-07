import styled, { css } from "styled-components";
import { COLORS } from "../../styles/colors";

export const Menu = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  border-radius: 0.3rem;
  border: 0.1rem solid ${COLORS.border};
  background: ${COLORS.white};
  box-shadow: 0 0.1rem 0.7rem 0 rgba(0, 0, 0, 0.06);
  padding: 0.8rem 0;
  z-index: 100;
`;

const MenuItemStyles = css`
  display: flex;
  align-items: center;
  padding: 0.8rem 1.6rem;
  cursor: pointer;

  &:hover {
    background-color: ${COLORS.hover};
  }
`;

export const MenuItem = styled.div`
  ${MenuItemStyles};
`;

export const MenuItemLink = styled.a`
  ${MenuItemStyles};
  text-decoration: none;
  color: ${COLORS.darkGray}!important;
`;
