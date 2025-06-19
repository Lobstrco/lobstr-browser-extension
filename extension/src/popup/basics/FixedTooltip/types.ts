// Types
export interface Position {
  x: number;
  y: number;
}

export interface Offset {
  x: number;
  y: number;
}

export interface FixedTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: string;
  showOnHover?: boolean;
  offset?: Offset;
  /**
   * Shift the entire tooltip (background, border, content) horizontally in percentages (from tooltip width)
   * Positive value - to the right, negative - to the left
   */
  bodyShiftXPercent?: number;
  /**
   * Maximum width of tooltip in percentage of viewport width
   * Default: 90 (90vw)
   */
  maxWidthPercent?: number;
}

// Constants
export const TOOLTIP_CONSTANTS = {
  Z_INDEX: {
    CONTAINER: 1000,
    ARROW: 10,
    ARROW_BORDER: 1,
    ARROW_FILL: 2,
  },
  SPACING: {
    ARROW_OFFSET: 6,
    ARROW_SIZE: 0.6,
    ARROW_INNER_SIZE: 0.5,
    ARROW_TOP_OFFSET: -0.1,
  },
  DEFAULTS: {
    MAX_WIDTH_PERCENT: 90,
    BODY_SHIFT_PERCENT: 0,
    SCREEN_MARGIN: 16,
  },
} as const; 