import * as React from "react";
import { ClipPath, Defs, G, Path, Svg } from 'react-native-svg';
import { IconProps } from "./types";

const ChatIcon = ({width = 21, height = 21} : IconProps) => (
  <Svg
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 21 21"
  >
    <G clipPath="url(#clip0_203_676)">
      <Path
        fill="#fff"
        stroke="#fff"
        strokeMiterlimit="10"
        strokeWidth="0.5"
        d="M10.372 20.694H8.21q-2.163-.002-4.32 0c-.333 0-.647-.13-.882-.365a1.26 1.26 0 0 1-.367-.883v-2.233A10.3 10.3 0 0 1 .05 10.372C.05 4.68 4.68.05 10.372.05s10.322 4.63 10.322 10.322-4.63 10.322-10.322 10.322Zm-4.2-1.201h4.2c5.03 0 9.121-4.091 9.121-9.121S15.401 1.25 10.372 1.25 1.25 5.342 1.25 10.372c0 2.308.864 4.51 2.432 6.202l.16.172v2.7a.05.05 0 0 0 .05.048z"
      ></Path>
    </G>
    <Defs>
      <ClipPath id="clip0_203_676">
        <Path fill="#fff" d="M0 0h20.744v20.744H0z"></Path>
      </ClipPath>
    </Defs>
  </Svg>
);

export default ChatIcon;
