import { Text, View } from "react-native";
import { Circle, G, Svg } from 'react-native-svg';

export const RoundProgressIndicator = ({progress, color, value, measure, text} : {progress: number, color: string, value: number, measure: string, text: string}) => {
    const size = 100;
    const strokeWidth = 8;
    const r = 45;

    const cx = size / 2;
    const cy = size / 2;

    const p = Math.min(1, progress)
    const C = 2 * Math.PI * r;
    const offset = C * (1 - p);

    return (
      <View>
        <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
        <G rotation={-90} originX={cx} originY={cy}>
          {/* Track (gri) */}
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke="#EAEAEA"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Progress (verde) */}
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${C} ${C}`}
            strokeDashoffset={offset}
          />
        </G>
      </Svg>
          <View
            style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
            }}
        >
            <Text style={{ fontSize: 18, fontWeight: "700" }}>{value}</Text>
            <Text style={{ fontSize: 16, color: "#747474" }}>{measure}</Text>
        </View>
          </View>
        <Text style={{alignSelf:'center', marginTop: 6}}>{text}</Text>
     

    </View>
    )
}