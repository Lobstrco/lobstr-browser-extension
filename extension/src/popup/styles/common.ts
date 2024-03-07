import { css } from "styled-components";
import { COLORS } from "./colors";

export const TitleStyles = css`
  font-size: 2.1rem;
  font-style: normal;
  font-weight: 500;
  color: ${COLORS.darkGray};
  line-height: normal;
`;

export const DescriptionStyles = css`
  font-size: 1.2rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.8rem;
  color: ${COLORS.darkGray}8A;
`;

export const WrapperStyles = css`
  padding: 1.6rem 2.4rem;
  display: flex;
  flex-direction: column;
`;

export const FlexAllCenter = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const TextEllipsis = css`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;
