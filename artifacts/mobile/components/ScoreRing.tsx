import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";

import { useColors } from "@/hooks/useColors";

interface ScoreRingProps {
  score: number;
  size?: number;
}

function getScoreColor(score: number) {
  if (score >= 80) return "#00E676";
  if (score >= 60) return "#FFB700";
  if (score >= 40) return "#FF9800";
  return "#FF4B4B";
}

function getScoreLabel(score: number) {
  if (score >= 80) return "ممتاز";
  if (score >= 60) return "جيد";
  if (score >= 40) return "متوسط";
  return "ضعيف";
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function ScoreRing({ score, size = 110 }: ScoreRingProps) {
  const colors = useColors();
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: score,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const strokeDashoffset = animValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const scoreColor = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={scoreColor} stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity="1" />
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
          stroke="url(#scoreGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View
        style={{
          position: "absolute",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "800",
            color: scoreColor,
            fontFamily: "Inter_700Bold",
          }}
        >
          {score}
        </Text>
        <Text
          style={{
            fontSize: 10,
            color: colors.mutedForeground,
            fontFamily: "Inter_400Regular",
            textAlign: "center",
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}
