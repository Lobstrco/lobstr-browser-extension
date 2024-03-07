import { createGlobalStyle } from "styled-components";
import {
  POPUP_HEIGHT,
  POPUP_WIDTH,
} from "../../background/constants/dimensions";
import { COLORS } from "./colors";
import { FlexAllCenter } from "./common";

const AppGlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  
  html {
    font-size: 62.5%; // 1rem = 10px
    animation-timing-function: linear;
    overflow-x: hidden;
    width: ${POPUP_WIDTH}px;
    height: ${POPUP_HEIGHT}px;
  }

  body {
    padding: 0;
    margin: 0;
    background-color: ${COLORS.hover};
    text-align: left;
    width: 100vw !important;
    height: 100vh !important;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
  }

  body,
  input,
  textarea,
  button {
    font: 400 1.4rem 'Ubuntu';
    line-height: 1.6rem;
    color: ${COLORS.darkGray};
  }
  
  h1, h2, h3, h4, h5, h6 {
  	margin: 0;
  }

  input, textarea, select, button, [role="button"] {
    outline: none !important;
    appearance: none;
  }

  ::placeholder {
    opacity: 1;
  }
  
  #root {
    ${FlexAllCenter};
    flex-direction: column;
    min-height: 100%;
    margin: 0 auto;
  }
`;

export default AppGlobalStyle;
