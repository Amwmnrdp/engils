import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";

import { useColors } from "@/hooks/useColors";

interface ScoreRingProps {
  spentPercent: number;
  size?: number;
}

function getSpendColor(pct: number) {
  if (pct < 50) return "#00E676";
  if (pct < 75) return "#FFB700";
  if (pct < 90) return "#FF9800";
  return "#FF4B4B";
}

function getSpendLabel(pct: number) {
  if (pct < 50) return "ممتاز";
  if (pct < 75) return "جيد";
  if (pct < 90) return "تنبّه";
  return "خطر";
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function ScoreRing({ spentPercent, size = 110 }: ScoreRingProps) {
  const colors = useColors();
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: Math.min(spentPercent, 100),
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [spentPercent]);

  const strokeDashoffset = animValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const ringColor = getSpendColor(spentPercent);
  const label = getSpendLabel(spentPercent);
  const pctDisplay = Math.round(spentPercent);

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgGradient id="spendGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={ringColor} stopOpacity="1" />
            <Stop offset="100%" stopColor={ringColor} stopOpacity="0.6" />
          </SvgGradient>
        </Defs>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.muted}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#spendGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={{ position: "absolute", alignItems: "center" }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "800",
            color: ringColor,
            fontFamily: "Inter_700Bold",
          }}
        >
          {pctDisplay}٪
        </Text>
        <Text
          style={{
            fontSize: 10,
            color: ringColor,
            fontFamily: "Inter_600SemiBold",
            textAlign: "center",
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}
