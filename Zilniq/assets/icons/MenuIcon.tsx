import { Path, Svg } from 'react-native-svg';
import { IconProps } from './types';

const MenuIcon = ({width = 29, height = 23, color = "#000"} : IconProps) => (
  <Svg
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 29 23"
  >
    <Path
      fill={color}
      d="M26.086 4.26H2.113C.96 4.26 0 3.292 0 2.13S.96 0 2.113 0h23.973C27.24 0 28.2.968 28.2 2.13s-.922 2.13-2.113 2.13M19.363 13.52H2.113C.96 13.52 0 12.552 0 11.39s.96-2.13 2.113-2.13h17.25c1.152 0 2.113.968 2.113 2.13s-.922 2.13-2.113 2.13M11.871 22.78H2.113C.96 22.78 0 21.81 0 20.65s.96-2.13 2.113-2.13h9.758c1.153 0 2.113.968 2.113 2.13 0 1.2-.96 2.13-2.113 2.13"
    ></Path>
  </Svg>
);

export default MenuIcon;
