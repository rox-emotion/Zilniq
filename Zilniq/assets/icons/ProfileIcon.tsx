import * as React from "react";
import { ClipPath, Defs, G, Path, Svg } from 'react-native-svg';
import { IconProps } from "./types";

const ProfileIcon = ({width = 16, height = 17, color = "#fff"} : IconProps) => (
  <Svg
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 16 17"
  >
    <G clipPath="url(#clip0_27_42)">
      <Path
        fill={color}
        fillRule="evenodd"
        d="M4.645 4.893A3.35 3.35 0 0 1 8 1.545a3.35 3.35 0 0 1 3.355 3.348A3.35 3.35 0 0 1 8 8.243a3.35 3.35 0 0 1-3.355-3.35m6.306 3.91a4.88 4.88 0 0 0 1.952-3.91A4.9 4.9 0 0 0 8 0a4.9 4.9 0 0 0-4.903 4.893c0 1.598.767 3.017 1.953 3.91A7.99 7.99 0 0 0 0 16.226a.774.774 0 0 0 1.548 0c0-3.556 2.889-6.44 6.452-6.44s6.452 2.884 6.452 6.44a.774.774 0 0 0 1.548 0 7.99 7.99 0 0 0-5.05-7.425"
        clipRule="evenodd"
      ></Path>
    </G>
    <Defs>
      <ClipPath id="clip0_27_42">
        <Path fill={color} d="M0 0h16v17H0z"></Path>
      </ClipPath>
    </Defs>
  </Svg>
);

export default ProfileIcon;
