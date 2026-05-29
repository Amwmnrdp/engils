import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AIInsight } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const INSIGHT_STYLES: Record<
  string,
  { bg: string; border: string; text: string; icon: string }
> = {
  warning: {
    bg: "#FF4B4B22",
    border: "#FF4B4B",
    text: "#FF4B4B",
    icon: "alert-triangle",
  },
  info: {
    bg: "#00D4FF22",
    border: "#00D4FF",
    text: "#00D4FF",
    icon: "info",
  },
  success: {
    bg: "#00E67622",
    border: "#00E676",
    text: "#00E676",
    icon: "check-circle",
  },
  tip: {
    bg: "#FFB70022",
    border: "#FFB700",
    text: "#FFB700",
    icon: "zap",
  },
};

interface AIInsightCardProps {
  insight: AIInsight;
}

function AIInsightCard({ insight }: AIInsightCardProps) {
  const colors = useColors();
  const style = INSIGHT_STYLES[insight.type] || INSIGHT_STYLES.info;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: style.bg,
          borderColor: style.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <View style={styles.row}>
        <Text style={[styles.message, { color: colors.foreground }]}>
          {insight.message}
        </Text>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: style.border + "33" },
          ]}
        >
          <Feather
            name={style.icon as any}
            size={16}
            color={style.text}
          />
        </View>
      </View>
    </View>
  );
}

interface AIInsightPanelProps {
  insights: AIInsight[];
}

export function AIInsightPanel({ insights }: AIInsightPanelProps) {
  const colors = useColors();

  if (insights.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="cpu" size={14} color={colors.primary} />
        <Text style={[styles.title, { color: colors.primary }]}>
          تحليل ذكي
        </Text>
      </View>
      {insights.map((insight) => (
        <AIInsightCard key={insight.id} insight={insight} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    textAlign: "right",
  },
  card: {
    padding: 12,
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  row: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 10,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  message: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "right",
    fontFamily: "Inter_400Regular",
  },
});
