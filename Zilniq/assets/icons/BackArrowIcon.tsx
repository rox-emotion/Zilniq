import { Path, Svg } from 'react-native-svg';
import { IconProps } from './types';

const BackArrowIcon = ({width = 24, height = 24, color = "#000"}: IconProps) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
  >
    <Path fill="none" d="M0 0h24v24H0z"></Path>
    <Path fill={color} d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"></Path>
  </Svg>
);

export default BackArrowIcon;
