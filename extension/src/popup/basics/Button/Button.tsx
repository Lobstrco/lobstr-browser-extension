import * as React from "react";
import styled from "styled-components";
import { COLORS } from "../../styles/colors";

const ButtonBody = styled.button<{ $fullWidth?: boolean; $isCancel?: boolean }>`
  border: none;
  border-radius: 0.6rem;
  display: flex;
  height: 4.8rem;
  min-height: 4.8rem;
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};
  padding: 0 0.8rem;
  justify-content: center;
  align-items: center;
  background-color: ${({ $isCancel }) =>
    $isCancel ? COLORS.border : COLORS.green};
  color: ${({ $isCancel }) => ($isCancel ? COLORS.darkGray : COLORS.white)};
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background-color: ${({ $isCancel }) =>
      $isCancel ? COLORS.hover : COLORS.greenHover};
  }
  &:active {
    background-color: ${({ $isCancel }) =>
      $isCancel ? COLORS.grayActive : COLORS.greenActive};
  }

  &:disabled {
    color: ${({ $isCancel }) =>
      $isCancel ? `${COLORS.darkGray}80` : `${COLORS.white}80`};
    pointer-events: none;
  }
`;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  fullWidth?: boolean;
  isCancel?: boolean;
}

const Button = ({ children, fullWidth, isCancel, ...props }: ButtonProps) => (
  <ButtonBody $fullWidth={fullWidth} $isCancel={isCancel} {...props}>
    {children}
  </ButtonBody>
);

export default Button;
