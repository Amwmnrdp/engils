import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleProp, Text, TextStyle } from "react-native";

interface AnimatedNumberProps {
  value: number;
  currency?: string;
  style?: StyleProp<TextStyle>;
  duration?: number;
  decimals?: number;
}

export function AnimatedNumber({
  value,
  currency = "SAR",
  style,
  duration = 1200,
  decimals = 0,
}: AnimatedNumberProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const from = prevValue.current;
    prevValue.current = value;

    animatedValue.setValue(from);
    const listener = animatedValue.addListener(({ value: v }) => {
      setDisplayValue(v);
    });

    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start(() => {
      animatedValue.removeListener(listener);
    });

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [value]);

  const formatted = displayValue
    .toFixed(decimals)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return (
    <Text style={style}>
      {formatted} {currency}
    </Text>
  );
}
