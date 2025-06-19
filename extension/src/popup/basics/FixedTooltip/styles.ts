import styled, { css } from "styled-components";
import { FIXED_TOOLTIP_POSITION } from "./FixedTooltip";
import { COLORS } from "../../styles/colors";
import { TOOLTIP_CONSTANTS } from "./types";

export const TooltipContainer = styled.div`
  position: fixed;
  z-index: ${TOOLTIP_CONSTANTS.Z_INDEX.CONTAINER};
  pointer-events: none;
`;

export const TooltipBody = styled.div<{
  $bodyShiftXPercent?: number;
  $maxWidthPercent?: number;
}>`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1.2rem;
  color: ${COLORS.darkGray};
  background-color: ${COLORS.white};
  box-shadow: 0 0.1rem 0.7rem #0000000f;
  border: 0.1rem solid ${COLORS.tooltipBorder};
  border-radius: 0.3rem;
  font-weight: 400;
  font-size: 1.2rem;
  line-height: 1.6rem;
  letter-spacing: 0;
  word-break: break-word;
  max-width: ${({ $maxWidthPercent }) => 
    $maxWidthPercent ? `${$maxWidthPercent}vw` : `${TOOLTIP_CONSTANTS.DEFAULTS.MAX_WIDTH_PERCENT}vw`
  };
  ${({ $bodyShiftXPercent }) =>
    $bodyShiftXPercent && $bodyShiftXPercent !== 0
      ? `transform: translateX(${$bodyShiftXPercent}%);`
      : ""}
`;

export const TooltipContent = styled.div`
  span {
    opacity: 0.54;
  }
`;

export const Arrow = styled.div<{
  position: FIXED_TOOLTIP_POSITION;
}>`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: ${TOOLTIP_CONSTANTS.Z_INDEX.ARROW};
  width: 1.2rem;
  height: 0.6rem;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ position }) => {
    switch (position) {
      case FIXED_TOOLTIP_POSITION.bottom:
        return css`
          bottom: 100%;
          transform: translateX(-50%) rotate(180deg);
        `;
      case FIXED_TOOLTIP_POSITION.top:
        return css`
          top: 100%;
        `;
      default:
        return "";
    }
  }}

  &::before {
    content: "";
    position: absolute;
    left: 50%;
    top: ${TOOLTIP_CONSTANTS.SPACING.ARROW_TOP_OFFSET}rem;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: ${TOOLTIP_CONSTANTS.SPACING.ARROW_SIZE}rem solid transparent;
    border-right: ${TOOLTIP_CONSTANTS.SPACING.ARROW_SIZE}rem solid transparent;
    border-top: ${TOOLTIP_CONSTANTS.SPACING.ARROW_SIZE}rem solid ${COLORS.tooltipBorder};
    z-index: ${TOOLTIP_CONSTANTS.Z_INDEX.ARROW_BORDER};
  }
  
  &::after {
    content: "";
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: ${TOOLTIP_CONSTANTS.SPACING.ARROW_TOP_OFFSET}rem;
    width: 0;
    height: 0;
    border-left: ${TOOLTIP_CONSTANTS.SPACING.ARROW_INNER_SIZE}rem solid transparent;
    border-right: ${TOOLTIP_CONSTANTS.SPACING.ARROW_INNER_SIZE}rem solid transparent;
    border-top: ${TOOLTIP_CONSTANTS.SPACING.ARROW_INNER_SIZE}rem solid ${COLORS.white};
    z-index: ${TOOLTIP_CONSTANTS.Z_INDEX.ARROW_FILL};
  }
`; 