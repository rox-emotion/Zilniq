import * as React from "react";
import { ClipPath, Defs, G, Path, Svg } from 'react-native-svg';
import { IconProps } from "./types";

const CloseIcon = ({width = 20, height = 20}: IconProps) => (
  <Svg
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 20 20"
  >
    <G fill="#000" clipPath="url(#clip0_203_548)">
      <Path d="M10 0C4.486 0 0 4.486 0 10s4.486 10 10 10 10-4.486 10-10S15.514 0 10 0m0 18.935c-4.927 0-8.935-4.008-8.935-8.935S5.073 1.065 10 1.065 18.935 5.073 18.935 10 14.927 18.935 10 18.935"/>
      <Path d="M13.688 6.844a.53.53 0 0 0-.155-.376.545.545 0 0 0-.754 0L10 9.247l-2.78-2.78a.545.545 0 0 0-.752 0 .53.53 0 0 0 0 .753L9.247 10l-2.78 2.78a.533.533 0 0 0 .754.752l2.78-2.78 2.778 2.78c.201.201.553.201.754 0a.53.53 0 0 0 0-.753L10.753 10l2.78-2.778a.53.53 0 0 0 .156-.377"/>
    </G>
    <Defs>
      <ClipPath id="clip0_203_548">
        <Path fill="#fff" d="M0 0h20v20H0z"/>
      </ClipPath>
    </Defs>
  </Svg>
);

export default CloseIcon;
