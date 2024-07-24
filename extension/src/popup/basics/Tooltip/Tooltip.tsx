import * as React from "react";
import styled, { css } from "styled-components";
import { useState } from "react";
import { COLORS } from "../../styles/colors";

export enum TOOLTIP_POSITION {
  top = "top",
  bottom = "bottom",
  left = "left",
  right = "right",
}

const ChildrenBlock = styled.div`
  position: relative;
  display: flex;
`;

// const TooltipTop = () => css`
//   bottom: calc(100% + 0.5rem);
//   left: 50%;
//   transform: translateX(-50%);
//
//   &::before {
//     top: 100%;
//     border-top: 0.75rem solid ${COLORS.tooltipBorder};
//     border-left: 0.75rem solid ${COLORS.transparent};
//     border-right: 0.75rem solid ${COLORS.transparent};
//   }
//
//   &::after {
//     top: 100%;
//     border-top: 0.6rem solid ${COLORS.tooltipBorder};
//     border-left: 0.6rem solid ${COLORS.transparent};
//     border-right: 0.6rem solid ${COLORS.transparent};
//   }
// `;

const TooltipBottom = () => css`
  top: calc(100% + 0.5rem);
  left: calc(50% + 2.2rem);
  transform: translateX(-100%);

  &::before {
    bottom: 100%;
    left: calc(100% - 3rem);
    border-bottom: 0.75rem solid ${COLORS.tooltipBorder};
    border-left: 0.75rem solid ${COLORS.transparent};
    border-right: 0.75rem solid ${COLORS.transparent};
  }

  &::after {
    bottom: 100%;
    left: calc(100% - 2.85rem);
    border-bottom: 0.6rem solid ${COLORS.white};
    border-left: 0.6rem solid ${COLORS.transparent};
    border-right: 0.6rem solid ${COLORS.transparent};
  }
`;

// const TooltipLeft = () => css`
//   top: 50%;
//   right: calc(100% + 0.5rem);
//   transform: translateY(-50%);
//
//   &::before {
//     left: 100%;
//     border-left: 0.75rem solid ${COLORS.tooltipBorder};
//     border-top: 0.75rem solid ${COLORS.transparent};
//     border-bottom: 0.75rem solid ${COLORS.transparent};
//   }
//
//   &::after {
//     left: 100%;
//     border-left: 0.6rem solid ${COLORS.white};
//     border-top: 0.6rem solid ${COLORS.transparent};
//     border-bottom: 0.6rem solid ${COLORS.transparent};
//   }
// `;
//
// const TooltipRight = () => css`
//   top: 50%;
//   left: calc(100% + 0.5rem);
//   transform: translateY(-50%);
//
//   &::before {
//     right: 100%;
//     border-right: 0.75rem solid ${COLORS.tooltipBorder};
//     border-top: 0.75rem solid ${COLORS.transparent};
//     border-bottom: 0.75rem solid ${COLORS.transparent};
//   }
//
//   &::after {
//     right: 100%;
//     border-right: 0.6rem solid ${COLORS.white};
//     border-top: 0.6rem solid ${COLORS.transparent};
//     border-bottom: 0.6rem solid ${COLORS.transparent};
//   }
// `;

const TooltipBody = styled.div<{
  position: TOOLTIP_POSITION;
}>`
  position: absolute;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0.9rem 1.2rem;
  color: ${COLORS.lightGray};
  background-color: ${COLORS.white};
  box-shadow: 0 0.1rem 0.7rem #0000000f;
  border: 0.1rem solid ${COLORS.tooltipBorder};
  border-radius: 0.5rem;
  white-space: nowrap;
  z-index: 10;

  &::after {
    content: "";
    display: block;
    position: absolute;
  }
  &::before {
    content: "";
    display: block;
    position: absolute;
  }

  // TODO Refactor tooltip position for top, left, right
  ${({ position }) =>
    // (position === TOOLTIP_POSITION.top && TooltipTop()) ||
    // (position === TOOLTIP_POSITION.left && TooltipLeft()) ||
    // (position === TOOLTIP_POSITION.right && TooltipRight()) ||
    position === TOOLTIP_POSITION.bottom && TooltipBottom()}
`;

interface TooltipProps extends React.DOMAttributes<HTMLDivElement> {
  children: React.ReactNode;
  content: React.ReactNode;
  position: TOOLTIP_POSITION;
  isShow?: boolean;
  showOnHover?: boolean;
}

const Tooltip = ({
  children,
  content,
  position = TOOLTIP_POSITION.top,
  isShow,
  showOnHover,
  ...props
}: TooltipProps): React.ReactElement => {
  const [onHover, setOnHover] = useState(false);

  return (
    <ChildrenBlock
      {...props}
      onMouseEnter={(e) => {
        e.stopPropagation();
        setOnHover(true);
      }}
      onMouseLeave={(e) => {
        e.stopPropagation();
        setOnHover(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        setOnHover((value) => !value);
      }}
    >
      {children}
      {(showOnHover ? onHover : isShow) && (
        <TooltipBody position={position}>{content}</TooltipBody>
      )}
    </ChildrenBlock>
  );
};

export default Tooltip;
