import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { FixedTooltipProps, TOOLTIP_CONSTANTS } from "./types";
import { calculateTooltipPosition, shouldShowArrow } from "./utils";
import { TooltipContainer, TooltipBody, TooltipContent, Arrow } from "./styles";

/**
 * FixedTooltip - component for displaying tooltips with fixed position relative to viewport
 * 
 * Features:
 * - Uses position: fixed for positioning relative to viewport
 * - Automatically centers tooltip relative to trigger element
 * - Arrow always points to the center of trigger element (implemented as separate element)
 * - Allows shifting the entire tooltip (background, border, content) in percentages via bodyShiftXPercent
 * - Prevents tooltip from going outside screen boundaries
 * - Supports text wrapping and max width configuration
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <FixedTooltip content={<span>Tooltip text</span>}>
 *   <button>Hover me</button>
 * </FixedTooltip>
 * 
 * // With custom positioning and width
 * <FixedTooltip
 *   content={<span>Long tooltip text</span>}
 *   position={FIXED_TOOLTIP_POSITION.bottom}
 *   bodyShiftXPercent={30}
 *   maxWidthPercent={60}
 * >
 *   <img src="icon.png" alt="icon" />
 * </FixedTooltip>
 * ```
 */

export enum FIXED_TOOLTIP_POSITION {
  top = "top",
  bottom = "bottom",
  left = "left",
  right = "right",
}

const FixedTooltip = ({
  children,
  content,
  position = FIXED_TOOLTIP_POSITION.bottom,
  showOnHover = true,
  offset = { x: 0, y: 0 },
  bodyShiftXPercent = TOOLTIP_CONSTANTS.DEFAULTS.BODY_SHIFT_PERCENT,
  maxWidthPercent = TOOLTIP_CONSTANTS.DEFAULTS.MAX_WIDTH_PERCENT,
}: FixedTooltipProps & { position?: FIXED_TOOLTIP_POSITION }): React.ReactElement => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updateTooltipPosition = useCallback(() => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current?.getBoundingClientRect();
    
    const newPosition = calculateTooltipPosition(triggerRect, tooltipRect, position, offset);
    setTooltipPosition(newPosition);
  }, [position, offset]);

  useEffect(() => {
    if (isVisible) {
      updateTooltipPosition();
    }
  }, [isVisible, updateTooltipPosition]);

  const handleMouseEnter = useCallback(() => {
    if (showOnHover) {
      setIsVisible(true);
    }
  }, [showOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (showOnHover) {
      setIsVisible(false);
    }
  }, [showOnHover]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ display: "flex" }}
      >
        {children}
      </div>
      {isVisible && (
        <TooltipContainer
          ref={tooltipRef}
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          <TooltipBody 
            $bodyShiftXPercent={bodyShiftXPercent} 
            $maxWidthPercent={maxWidthPercent}
          >
            <TooltipContent>{content}</TooltipContent>
          </TooltipBody>
          {shouldShowArrow(position) && (
            <Arrow position={position} />
          )}
        </TooltipContainer>
      )}
    </>
  );
};

export default FixedTooltip;
