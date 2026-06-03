import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, G, Text as SvgText } from "react-native-svg";

import { GlassCard } from "@/components/GlassCard";
import { CATEGORY_COLORS, CATEGORY_NAMES } from "@/constants/quotes";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const SCREEN_WIDTH = Dimensions.get("window").width;

function DonutChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const size = SCREEN_WIDTH - 80;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 16;
  const innerR = outerR * 0.6;
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  let currentAngle = -90;
  const slices = data.map((d) => {
    const angle = (d.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return { ...d, startAngle, angle };
  });

  function polarToXY(angle: number, r: number) {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  function arcPath(
    startAngle: number,
    sweepAngle: number,
    r: number,
    ir: number
  ) {
    const endAngle = startAngle + sweepAngle - 0.5;
    const s = polarToXY(startAngle, r);
    const e = polarToXY(endAngle, r);
    const si = polarToXY(endAngle, ir);
    const ei = polarToXY(startAngle, ir);
    const large = sweepAngle > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} L ${si.x} ${si.y} A ${ir} ${ir} 0 ${large} 0 ${ei.x} ${ei.y} Z`;
  }

  const { default: Path } = require("react-native-svg");

  return (
    <Svg width={size} height={size}>
      <G>
        {slices.map((slice, i) => (
          <Path
            key={i}
            d={arcPath(slice.startAngle, slice.angle, outerR, innerR)}
            fill={slice.color}
            opacity={0.9}
          />
        ))}
      </G>
      <SvgText
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        fontSize={14}
        fontWeight="700"
        fill="#8892B0"
      >
        الإجمالي
      </SvgText>
      <SvgText
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        fontSize={18}
        fontWeight="800"
        fill="#F0F4FF"
      >
        {total.toLocaleString("ar-SA")}
      </SvgText>
    </Svg>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) {
  const colors = useColors();
  return (
    <GlassCard style={styles.statCard} padding={14}>
      <View
        style={[
          styles.statIcon,
          { backgroundColor: color + "22" },
        ]}
      >
        <Feather name={icon as any} size={18} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </GlassCard>
  );
}

export default function AnalyticsScreen() {
  const colors = useColors();
  const { expenses, income, totalSpent, remainingBalance, settings } = useApp();

  const unpaidExpenses = expenses.filter((e) => !e.paid);
  const paidExpenses = expenses.filter((e) => e.paid);

  const categoryTotals: Record<string, number> = {};
  unpaidExpenses.forEach((e) => {
    categoryTotals[e.category] =
      (categoryTotals[e.category] || 0) + e.amount;
  });

  const chartData = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([cat, val]) => ({
      label: CATEGORY_NAMES[cat] || cat,
      value: val,
      color: CATEGORY_COLORS[cat] || "#95A5A6",
    }));

  const savingsRate =
    income > 0
      ? Math.max(0, Math.round(((income - totalSpent) / income) * 100))
      : 0;

  const urgentCount = unpaidExpenses.filter((e) => {
    const daysLeft = Math.ceil(
      (new Date(e.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysLeft >= 0 && daysLeft <= 7;
  }).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <LinearGradient
        colors={
          colors.isDark
            ? ["#070D1B", "#0A1628", "#070D1B"]
            : ["#EEF2FF", "#E0E8FF", "#EEF2FF"]
        }
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              التحليل المالي
            </Text>
            <Feather name="bar-chart-2" size={22} color={colors.primary} />
          </View>

          <View style={styles.statsGrid}>
            <StatCard
              label="الدخل الشهري"
              value={`${income.toLocaleString("ar-SA")} ${settings.currency}`}
              icon="trending-up"
              color={colors.success}
            />
            <StatCard
              label="إجمالي المصاريف"
              value={`${totalSpent.toLocaleString("ar-SA")} ${settings.currency}`}
              icon="trending-down"
              color={colors.danger}
            />
            <StatCard
              label="الرصيد المتبقي"
              value={`${remainingBalance.toLocaleString("ar-SA")} ${settings.currency}`}
              icon="dollar-sign"
              color={remainingBalance >= 0 ? colors.primary : colors.danger}
            />
            <StatCard
              label="نسبة الادخار"
              value={`${savingsRate}٪`}
              icon="percent"
              color={colors.accent}
            />
            <StatCard
              label="مصاريف مستعجلة"
              value={`${urgentCount} مصروف`}
              icon="clock"
              color={urgentCount > 0 ? colors.warning : colors.success}
            />
            <StatCard
              label="مصاريف مدفوعة"
              value={`${paidExpenses.length}`}
              icon="check-circle"
              color={colors.success}
            />
          </View>

          {chartData.length > 0 ? (
            <GlassCard style={styles.chartCard}>
              <Text
                style={[styles.chartTitle, { color: colors.foreground }]}
              >
                توزيع المصاريف حسب الفئة
              </Text>
              <View style={styles.chartContainer}>
                <DonutChart data={chartData} />
              </View>
              <View style={styles.legend}>
                {chartData.map((item) => (
                  <View key={item.label} style={styles.legendItem}>
                    <Text
                      style={[
                        styles.legendValue,
                        { color: colors.foreground },
                      ]}
                    >
                      {item.value.toLocaleString("ar-SA")}
                    </Text>
                    <Text
                      style={[
                        styles.legendLabel,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {item.label}
                    </Text>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: item.color },
                      ]}
                    />
                  </View>
                ))}
              </View>
            </GlassCard>
          ) : (
            <GlassCard style={styles.chartCard}>
              <View style={styles.emptyChart}>
                <Feather
                  name="bar-chart"
                  size={40}
                  color={colors.mutedForeground}
                  style={{ opacity: 0.4 }}
                />
                <Text
                  style={[styles.emptyText, { color: colors.mutedForeground }]}
                >
                  أضف مصاريف لعرض التحليل
                </Text>
              </View>
            </GlassCard>
          )}

          {unpaidExpenses.length > 0 && income > 0 && (
            <GlassCard style={styles.breakdownCard}>
              <Text
                style={[styles.chartTitle, { color: colors.foreground }]}
              >
                تفصيل الفئات
              </Text>
              {Object.entries(categoryTotals)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, val]) => {
                  const pct = Math.round((val / income) * 100);
                  const catColor = CATEGORY_COLORS[cat] || "#95A5A6";
                  return (
                    <View key={cat} style={styles.breakdownRow}>
                      <Text
                        style={[
                          styles.breakdownPct,
                          { color: catColor },
                        ]}
                      >
                        {pct}٪
                      </Text>
                      <View style={styles.breakdownBar}>
                        <View
                          style={[
                            styles.breakdownFill,
                            {
                              backgroundColor: colors.muted,
                              flex: 1,
                              borderRadius: 4,
                              height: 8,
                              overflow: "hidden",
                            },
                          ]}
                        >
                          <View
                            style={{
                              width: `${pct}%`,
                              height: "100%",
                              backgroundColor: catColor,
                              borderRadius: 4,
                            }}
                          />
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.breakdownLabel,
                          { color: colors.foreground },
                        ]}
                      >
                        {CATEGORY_NAMES[cat] || cat}
                      </Text>
                    </View>
                  );
                })}
            </GlassCard>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  statsGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    alignItems: "flex-end",
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    marginTop: 2,
  },
  chartCard: { marginBottom: 14 },
  chartTitle: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  legend: { gap: 8 },
  legendItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
    fontSize: 13,
    textAlign: "right",
    fontFamily: "Inter_400Regular",
  },
  legendValue: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  emptyChart: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  breakdownCard: { marginBottom: 14 },
  breakdownRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  breakdownLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    width: 60,
    textAlign: "right",
  },
  breakdownBar: { flex: 1 },
  breakdownFill: {},
  breakdownPct: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    width: 36,
    textAlign: "left",
  },
});
