import styled from "styled-components";
import { COLORS } from "../../styles/colors";

export const List = styled.div<{ $withScroll: boolean }>`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  margin-right: ${({ $withScroll }) => ($withScroll ? "-1.2rem" : "0")};
  padding-right: ${({ $withScroll }) => ($withScroll ? "0.8rem" : "0")};
  margin-bottom: auto;

  &::-webkit-scrollbar {
    width: 0.4rem;
  }

  /* Track */
  &::-webkit-scrollbar-track {
    background: ${COLORS.white};
  }

  /* Handle */
  &::-webkit-scrollbar-thumb {
    background: ${COLORS.lightGray}80;
    border-radius: 0.2rem;
  }
`;
