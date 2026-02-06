import * as React from "react";
import { Rect, Svg } from 'react-native-svg';
import { IconProps } from "./types";

const StatsIcon = ({width = 21, height = 19, color = "#fff"} : IconProps) => (
  <Svg
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 21 19"
  >
    <Rect
      width="3"
      height="19"
      fill="#fff"
      rx="1.5"
      transform="matrix(-1 0 0 1 3 0)"
    ></Rect>
    <Rect
      width="3"
      height="11"
      fill="#fff"
      rx="1.5"
      transform="matrix(-1 0 0 1 9 8)"
    ></Rect>
    <Rect
      width="3"
      height="15"
      fill="#fff"
      rx="1.5"
      transform="matrix(-1 0 0 1 15 4)"
    ></Rect>
    <Rect
      width="3"
      height="7"
      fill="#fff"
      rx="1.5"
      transform="matrix(-1 0 0 1 21 12)"
    ></Rect>
  </Svg>
);

export default StatsIcon;
