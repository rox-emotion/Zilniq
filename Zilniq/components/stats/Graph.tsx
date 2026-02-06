import { useAuth } from "@clerk/clerk-expo";
import React, { useEffect, useState } from "react";
import { Dimensions, Text, View } from "react-native";
import Svg, { Line, Rect, Text as SvgText } from "react-native-svg";

type DayDatum = { day: string; value: number };

type Props = {
  date: Date;
};

export function Graph({ date }: Props) {
  const width = Dimensions.get('window').width;
  const height = 250; // Redus de la 280
  const chartTop = 40;
  const chartHeight = 180;
  const chartBottom = chartTop + chartHeight;
  const GOAL = 2560;

  const [days, setDays] = useState<DayDatum[]>([]);
  const [maxY, setMaxY] = useState<number>(GOAL);
  const { getToken } = useAuth();

  const fetchWeeklyTotals = async () => {
    const token = await getToken();
    const formattedDate = date.toISOString().split('T')[0];

    const response = await fetch(
      `https://payload-cms-production-c64b.up.railway.app/api/analytics/weekly?startDate=${formattedDate}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      }
    );

    const data = await response.json();

    // Get day name
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekData = data.week.map((dayData, index) => {
      const currentDate = new Date(date);
      currentDate.setDate(currentDate.getDate() - (6 - index));
      const dayName = dayNames[currentDate.getDay()];
      return { day: dayName, value: dayData.kcal };
    });

    setDays(weekData);

    const weekMax = Math.max(...data.week.map(d => d.kcal));
    
    if (weekMax > GOAL) {
      setMaxY(weekMax * 1.1);
    } else {
      setMaxY(GOAL * 1.15);
    }
  };

  useEffect(() => {
    fetchWeeklyTotals();
  }, [date]);

  const computedMax = maxY;
  const barWidth = 18;
  const totalBarsWidth = days.length * barWidth;
  const totalGapsWidth = width - 60 - totalBarsWidth;
  const gap = totalGapsWidth / (days.length);
  const startX = 60;

  const yGoal = chartBottom - (GOAL / computedMax) * chartHeight;

  const hasOverGoal = days.some(d => d.value > GOAL);
  const actualMax = Math.max(...days.map(d => d.value));

  const yLabels = hasOverGoal 
    ? [0, 1500, GOAL, Math.round(actualMax)]
    : [0, 1500, GOAL];

  return (
    <View>
      <Svg width={width} height={height}>
        {/* Y-axis labels */}
        {yLabels.map((val) => {
          const y = chartBottom - (val / computedMax) * chartHeight;
          return (
            <SvgText
              key={val}
              x={10}
              y={y + 5}
              fontSize={14}
              fill="#999"
              textAnchor="start"
            >
              {val}
            </SvgText>
          );
        })}

        {/* Goal line */}
        <Line
          x1={startX - 10}
          x2={width - 20}
          y1={yGoal}
          y2={yGoal}
          stroke="#2DCC74"
          strokeWidth={1}
          strokeDasharray="4 2"
        />

        {/* Bars */}
        {days.map((d, i) => {
          const x = startX + i * (barWidth + gap);

          const isOver = d.value > GOAL;
          
          let fillH, yFill, fillColor;
          
          if (isOver) {
            fillH = (d.value / computedMax) * chartHeight;
            yFill = chartBottom - fillH;
            fillColor = "#217596";
          } else {
            fillH = (d.value / computedMax) * chartHeight;
            yFill = chartBottom - fillH;
            fillColor = "#2DCC74";
          }

          const trackColor = "#F3F4F6";
          const trackHeight = isOver ? (d.value / computedMax) * chartHeight : (GOAL / computedMax) * chartHeight;
          const trackY = isOver ? yFill : chartBottom - trackHeight;

          return (
            <React.Fragment key={`${d.day}-${i}`}>
              {/* Background track */}
              <Rect
                x={x}
                y={trackY}
                width={barWidth}
                height={trackHeight}
                rx={10}
                fill={trackColor}
              />

              {/* Filled portion */}
              <Rect
                x={x}
                y={yFill}
                width={barWidth}
                height={fillH}
                rx={10}
                fill={fillColor}
              />
              
              {/* Day label inside SVG - aligned under each bar */}
              <SvgText
                x={x + barWidth / 2}
                y={chartBottom + 18}
                fontSize={14}
                fill="#6B7280"
                textAnchor="middle"
              >
                {d.day}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Legend */}
      <View style={{ 
        flexDirection: "row", 
        justifyContent: "center", 
        alignItems: "center",
        marginTop: 12,
        gap: 24
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#10B981" }} />
          <Text style={{ color: "#6B7280", fontSize: 14 }}>Under goal</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#0E7490" }} />
          <Text style={{ color: "#6B7280", fontSize: 14 }}>Over goal</Text>
        </View>
      </View>
    </View>
  );
}