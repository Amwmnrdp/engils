import { BlurView } from "expo-blur";
import React from "react";
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useColorScheme,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  padding?: number;
}

export function GlassCard({
  children,
  style,
  intensity = 25,
  padding = 16,
}: GlassCardProps) {
  const colors = useColors();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    <View
      style={[
        styles.container,
        { borderRadius: colors.radius, borderColor: colors.glassBorder },
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint={isDark ? "dark" : "light"}
        style={[StyleSheet.absoluteFill, { borderRadius: colors.radius }]}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.glass, borderRadius: colors.radius },
        ]}
      />
      <View style={{ padding, position: "relative", zIndex: 1 }}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
});
