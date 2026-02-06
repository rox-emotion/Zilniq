import * as React from "react";
import { ClipPath, Defs, G, Path, Svg } from "react-native-svg";
import { IconProps } from "./types";

const SendIcon = ({width = 20, height = 20, color = "#fff"} : IconProps) => (
  <Svg
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 19 19"
  >
    <G clipPath="url(#clip0_7_399)">
      <Path
        fill={color}
        d="M18.927 2.132a2.755 2.755 0 0 0-3.65-1.956L1.902 4.651a2.761 2.761 0 0 0-.111 5.21l4.965 1.898a.85.85 0 0 1 .486.51l1.894 4.987v.026A2.765 2.765 0 0 0 11.711 19h.025a2.73 2.73 0 0 0 2.585-1.899l4.524-13.425a2.76 2.76 0 0 0 .082-1.544m-1.872.924-4.53 13.466a.83.83 0 0 1-.795.58.87.87 0 0 1-.811-.552l-1.894-4.987q-.039-.095-.082-.184l3.122-3.14-1.339-1.341-3.134 3.143c-.054-.026-.104-.051-.161-.073l-4.975-1.9a.85.85 0 0 1-.559-.825c0-.366.239-.69.587-.798L15.92 1.951a.86.86 0 0 1 1.136 1.092z"
      ></Path>
    </G>
    <Defs>
      <ClipPath id="clip0_7_399">
        <Path fill={color} d="M0 0h19v19H0z"></Path>
      </ClipPath>
    </Defs>
  </Svg>
);

export default SendIcon;
