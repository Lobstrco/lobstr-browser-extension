import { FIXED_TOOLTIP_POSITION } from "./FixedTooltip";
import { Position, Offset, TOOLTIP_CONSTANTS } from "./types";

/**
 * Calculates tooltip position based on trigger element position and tooltip dimensions
 */
export const calculateTooltipPosition = (
  triggerRect: DOMRect,
  tooltipRect: DOMRect | undefined,
  position: FIXED_TOOLTIP_POSITION,
  offset: Offset
): Position => {
  const tooltipWidth = tooltipRect?.width || 0;
  const tooltipHeight = tooltipRect?.height || 0;
  
  switch (position) {
    case FIXED_TOOLTIP_POSITION.bottom:
      return {
        x: triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2 + offset.x,
        y: triggerRect.bottom + TOOLTIP_CONSTANTS.SPACING.ARROW_OFFSET + offset.y,
      };
      
    case FIXED_TOOLTIP_POSITION.top:
      return {
        x: triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2 + offset.x,
        y: triggerRect.top - tooltipHeight - TOOLTIP_CONSTANTS.SPACING.ARROW_OFFSET + offset.y,
      };
      
    case FIXED_TOOLTIP_POSITION.left:
      return {
        x: triggerRect.left - tooltipWidth - TOOLTIP_CONSTANTS.SPACING.ARROW_OFFSET + offset.x,
        y: triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2 + offset.y,
      };
      
    case FIXED_TOOLTIP_POSITION.right:
      return {
        x: triggerRect.right + TOOLTIP_CONSTANTS.SPACING.ARROW_OFFSET + offset.x,
        y: triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2 + offset.y,
      };
      
    default:
      return { x: 0, y: 0 };
  }
};

/**
 * Determines if arrow should be shown for given position
 */
export const shouldShowArrow = (position: FIXED_TOOLTIP_POSITION): boolean => 
  position === FIXED_TOOLTIP_POSITION.bottom || position === FIXED_TOOLTIP_POSITION.top; 