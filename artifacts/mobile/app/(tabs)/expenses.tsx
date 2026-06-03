import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Circle, Path, Svg, Text as SvgText } from "react-native-svg";

import { AddExpenseModal } from "@/components/AddExpenseModal";
import { ExpenseCard } from "@/components/ExpenseCard";
import { CATEGORY_COLORS, CATEGORY_NAMES } from "@/constants/quotes";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_W } = Dimensions.get("window");
const CHART_SIZE = Math.min(SCREEN_W * 0.52, 200);
const RADIUS = CHART_SIZE / 2 - 10;
const INNER_RADIUS = RADIUS * 0.58;
const CX = CHART_SIZE / 2;
const CY = CHART_SIZE / 2;

function polarToXY(angle: number, r: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function buildArc(startAngle: number, endAngle: number, r: number, ir: number): string {
  const sa = endAngle - startAngle >= 360 ? endAngle - 0.01 : endAngle;
  const s1 = polarToXY(startAngle, r);
  const e1 = polarToXY(sa, r);
  const s2 = polarToXY(sa, ir);
  const e2 = polarToXY(startAngle, ir);
  const large = sa - startAngle > 180 ? 1 : 0;
  return `M ${s1.x} ${s1.y} A ${r} ${r} 0 ${large} 1 ${e1.x} ${e1.y} L ${s2.x} ${s2.y} A ${ir} ${ir} 0 ${large} 0 ${e2.x} ${e2.y} Z`;
}

interface DonutSlice {
  category: string;
  amount: number;
  pct: number;
  color: string;
  startAngle: number;
  endAngle: number;
}

function DonutChart({ slices, totalSpent, currency }: {
  slices: DonutSlice[];
  totalSpent: number;
  currency: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const colors = useColors();
  const activeSlice = slices.find((s) => s.category === active) ?? null;

  return (
    <View style={donutStyles.wrap}>
      {/* Chart */}
      <Svg width={CHART_SIZE} height={CHART_SIZE}>
        {slices.map((s) => {
          const isActive = active === s.category;
          const r = isActive ? RADIUS + 6 : RADIUS;
          const d = buildArc(s.startAngle, s.endAngle, r, INNER_RADIUS);
          return (
            <Path
              key={s.category}
              d={d}
              fill={s.color}
              opacity={active && !isActive ? 0.3 : 1}
              onPress={() => {
                setActive(active === s.category ? null : s.category);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            />
          );
        })}

        {/* Center background */}
        <Circle
          cx={CX}
          cy={CY}
          r={INNER_RADIUS - 2}
          fill={colors.surface ?? colors.background}
        />

        {/* Center text — total or selected */}
        {activeSlice ? (
          <>
            <SvgText
              x={CX}
              y={CY - 7}
              textAnchor="middle"
              fontSize={12}
              fontWeight="700"
              fill={activeSlice.color}
            >
              {activeSlice.amount.toLocaleString("ar-SA")}
            </SvgText>
            <SvgText
              x={CX}
              y={CY + 10}
              textAnchor="middle"
              fontSize={10}
              fill={colors.mutedForeground}
            >
              {`${activeSlice.pct.toFixed(1)}%`}
            </SvgText>
          </>
        ) : (
          <>
            <SvgText
              x={CX}
              y={CY - 7}
              textAnchor="middle"
              fontSize={12}
              fontWeight="700"
              fill={colors.foreground}
            >
              {totalSpent.toLocaleString("ar-SA")}
            </SvgText>
            <SvgText
              x={CX}
              y={CY + 10}
              textAnchor="middle"
              fontSize={10}
              fill={colors.mutedForeground}
            >
              {currency}
            </SvgText>
          </>
        )}
      </Svg>

      {/* Legend */}
      <View style={donutStyles.legend}>
        {slices.map((s) => (
          <TouchableOpacity
            key={s.category}
            style={[
              donutStyles.legendItem,
              active === s.category && {
                backgroundColor: s.color + "20",
                borderRadius: 8,
              },
            ]}
            onPress={() => {
              setActive(active === s.category ? null : s.category);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <View style={[donutStyles.dot, { backgroundColor: s.color }]} />
            <View style={donutStyles.legendText}>
              <Text style={[donutStyles.legendCat, { color: colors.foreground }]}>
                {CATEGORY_NAMES[s.category] ?? s.category}
              </Text>
              <Text style={[donutStyles.legendPct, { color: s.color }]}>
                {`${s.pct.toFixed(0)}%`}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const donutStyles = StyleSheet.create({
  wrap: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  legend: {
    flex: 1,
    gap: 2,
    paddingRight: 4,
  },
  legendItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    flexShrink: 0,
  },
  legendText: {
    flex: 1,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  legendCat: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
  },
  legendPct: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
});

type FilterType = "all" | "normal" | "medium" | "high" | "paid";

export default function ExpensesScreen() {
  const colors = useColors();
  const { expenses, totalSpent, income, settings } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredExpenses = expenses.filter((e) => {
    if (filter === "all") return !e.paid;
    if (filter === "paid") return e.paid;
    return e.importance === filter && !e.paid;
  });

  const unpaidCount = expenses.filter((e) => !e.paid).length;
  const paidCount = expenses.filter((e) => e.paid).length;
  const highCount = expenses.filter((e) => e.importance === "high" && !e.paid).length;

  // Build donut chart slices from unpaid expenses
  const unpaidExpenses = expenses.filter((e) => !e.paid);
  const totalUnpaid = unpaidExpenses.reduce((s, e) => s + e.amount, 0);

  const categoryMap: Record<string, number> = {};
  for (const e of unpaidExpenses) {
    categoryMap[e.category] = (categoryMap[e.category] ?? 0) + e.amount;
  }

  const donutSlices: DonutSlice[] = [];
  if (totalUnpaid > 0) {
    let angle = 0;
    const sorted = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
    for (const [cat, amt] of sorted) {
      const pct = (amt / totalUnpaid) * 100;
      const sweep = (amt / totalUnpaid) * 360;
      donutSlices.push({
        category: cat,
        amount: amt,
        pct,
        color: CATEGORY_COLORS[cat] ?? "#888",
        startAngle: angle,
        endAngle: angle + sweep,
      });
      angle += sweep;
    }
  }

  const FILTERS: { key: FilterType; label: string; color: string }[] = [
    { key: "all", label: `الكل (${unpaidCount})`, color: colors.primary },
    { key: "high", label: `شديد (${highCount})`, color: "#FF4B4B" },
    { key: "medium", label: "متوسط", color: "#FFB700" },
    { key: "normal", label: "عادي", color: "#10B981" },
    { key: "paid", label: `مدفوع (${paidCount})`, color: colors.mutedForeground },
  ];

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
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>مصاريفي</Text>
          <Feather name="credit-card" size={22} color={colors.primary} />
        </View>

        {income > 0 && (
          <View style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>{unpaidCount}</Text>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>قيد الانتظار</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.danger }]}>
                {totalSpent.toLocaleString("ar-SA")}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                إجمالي ({settings.currency})
              </Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.success }]}>{paidCount}</Text>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>مدفوع</Text>
            </View>
          </View>
        )}

        {/* Donut chart — only when there are unpaid expenses */}
        {donutSlices.length > 0 && (
          <View
            style={[
              styles.chartCard,
              {
                backgroundColor: (colors as any).card ?? colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.chartTitle, { color: colors.foreground }]}>
              توزيع المصاريف غير المدفوعة
            </Text>
            <DonutChart
              slices={donutSlices}
              totalSpent={totalUnpaid}
              currency={settings.currency}
            />
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
          style={styles.filtersScroll}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === f.key ? f.color + "22" : colors.muted,
                  borderColor: filter === f.key ? f.color : "transparent",
                },
              ]}
              onPress={() => setFilter(f.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: filter === f.key ? f.color : colors.mutedForeground },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {filteredExpenses.length === 0 ? (
            <View style={styles.empty}>
              <Feather
                name="inbox"
                size={48}
                color={colors.mutedForeground}
                style={{ marginBottom: 12, opacity: 0.5 }}
              />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>لا توجد مصاريف</Text>
              <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
                اضغط + لإضافة مصروف جديد
              </Text>
            </View>
          ) : (
            filteredExpenses.map((expense, index) => (
              <ExpenseCard key={expense.id} expense={expense} index={index} />
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setShowAdd(true);
        }}
      >
        <Feather name="plus" size={26} color={colors.primaryForeground} />
      </TouchableOpacity>

      <AddExpenseModal visible={showAdd} onClose={() => setShowAdd(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  summaryRow: {
    flexDirection: "row-reverse",
    paddingHorizontal: 20,
    paddingBottom: 14,
    marginBottom: 4,
    borderBottomWidth: 1,
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryValue: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  summaryLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    textAlign: "center",
  },
  summaryDivider: { width: 1, marginHorizontal: 8 },
  chartCard: {
    marginHorizontal: 14,
    marginVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    marginBottom: 6,
  },
  filtersScroll: { flexGrow: 0 },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: "row",
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  filterText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  list: { flex: 1 },
  listContent: { paddingTop: 8 },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginBottom: 6,
  },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  fab: {
    position: "absolute",
    bottom: 90,
    left: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
