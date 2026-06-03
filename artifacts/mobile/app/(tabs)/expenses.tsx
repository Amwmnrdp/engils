import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AddExpenseModal } from "@/components/AddExpenseModal";
import { ExpenseCard } from "@/components/ExpenseCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

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
  const highCount = expenses.filter(
    (e) => e.importance === "high" && !e.paid
  ).length;

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
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            مصاريفي
          </Text>
          <Feather name="credit-card" size={22} color={colors.primary} />
        </View>

        {income > 0 && (
          <View
            style={[
              styles.summaryRow,
              { borderBottomColor: colors.border },
            ]}
          >
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>
                {unpaidCount}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                قيد الانتظار
              </Text>
            </View>
            <View
              style={[styles.summaryDivider, { backgroundColor: colors.border }]}
            />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.danger }]}>
                {totalSpent.toLocaleString("ar-SA")}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                إجمالي ({settings.currency})
              </Text>
            </View>
            <View
              style={[styles.summaryDivider, { backgroundColor: colors.border }]}
            />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.success }]}>
                {paidCount}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                مدفوع
              </Text>
            </View>
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
                  backgroundColor:
                    filter === f.key ? f.color + "22" : colors.muted,
                  borderColor:
                    filter === f.key ? f.color : "transparent",
                },
              ]}
              onPress={() => setFilter(f.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color:
                      filter === f.key ? f.color : colors.mutedForeground,
                  },
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
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                لا توجد مصاريف
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: colors.mutedForeground }]}
              >
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
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  summaryLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    textAlign: "center",
  },
  summaryDivider: { width: 1, marginHorizontal: 8 },
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
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
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
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
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
