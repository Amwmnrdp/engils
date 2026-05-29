import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_NAMES } from "@/constants/quotes";
import { Expense, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

interface ExpenseCardProps {
  expense: Expense;
  index: number;
}

function getDaysUntilDeadline(deadline: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dl = new Date(deadline);
  dl.setHours(0, 0, 0, 0);
  return Math.ceil((dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

const IMPORTANCE_COLORS = {
  normal: "#10B981",
  medium: "#FFB700",
  high: "#FF4B4B",
};

const IMPORTANCE_LABELS = {
  normal: "عادي",
  medium: "متوسط",
  high: "شديد",
};

export function ExpenseCard({ expense, index }: ExpenseCardProps) {
  const colors = useColors();
  const { deleteExpense, markExpensePaid } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const daysLeft = getDaysUntilDeadline(expense.deadline);
  const importanceColor = IMPORTANCE_COLORS[expense.importance];
  const categoryColor = CATEGORY_COLORS[expense.category] || "#95A5A6";
  const categoryIcon = CATEGORY_ICONS[expense.category] || "more-horizontal";
  const catName = CATEGORY_NAMES[expense.category] || "أخرى";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDelete = () => {
    Alert.alert("حذف المصروف", `هل تريد حذف "${expense.name}"؟`, [
      { text: "إلغاء", style: "cancel" },
      { text: "حذف", style: "destructive", onPress: () => deleteExpense(expense.id) },
    ]);
  };

  const handlePay = () => {
    Alert.alert("تأكيد الدفع", `هل دفعت "${expense.name}"؟`, [
      { text: "إلغاء", style: "cancel" },
      { text: "نعم", onPress: () => markExpensePaid(expense.id) },
    ]);
  };

  const getDeadlineText = () => {
    if (daysLeft < 0) return `متأخر ${Math.abs(daysLeft)} يوم`;
    if (daysLeft === 0) return "اليوم";
    if (daysLeft === 1) return "غداً";
    return `${daysLeft} يوم`;
  };

  const deadlineUrgent = daysLeft <= 2;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: expense.paid ? 0.5 : fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: colors.border,
          borderRightColor: importanceColor,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor + "22" }]}>
          <Feather name={categoryIcon as any} size={18} color={categoryColor} />
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
              {expense.name}
            </Text>
            {expense.paid && (
              <View style={[styles.paidBadge, { backgroundColor: colors.success + "22" }]}>
                <Text style={[styles.paidText, { color: colors.success }]}>مدفوع</Text>
              </View>
            )}
          </View>

          <View style={styles.metaRow}>
            <View style={[styles.catChip, { backgroundColor: categoryColor + "22" }]}>
              <Text style={[styles.catText, { color: categoryColor }]}>{catName}</Text>
            </View>
            <View style={[styles.importanceDot, { backgroundColor: importanceColor + "22" }]}>
              <Text style={[styles.importanceText, { color: importanceColor }]}>
                {IMPORTANCE_LABELS[expense.importance]}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.amountSection}>
          <Text style={[styles.amount, { color: colors.primary }]}>
            {expense.amount.toLocaleString("ar-SA")}
          </Text>
          <Text style={[styles.currency, { color: colors.mutedForeground }]}>ر.س</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.footer}>
        <View style={styles.deadlineSection}>
          <Feather
            name="clock"
            size={12}
            color={deadlineUrgent ? colors.danger : colors.mutedForeground}
          />
          <Text style={[styles.deadline, { color: deadlineUrgent ? colors.danger : colors.mutedForeground }]}>
            {getDeadlineText()}
          </Text>
        </View>

        {!expense.paid && (
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handlePay}
              style={[styles.actionBtn, { backgroundColor: colors.success + "22" }]}
            >
              <Feather name="check" size={14} color={colors.success} />
              <Text style={[styles.actionText, { color: colors.success }]}>دفعت</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.actionBtn, { backgroundColor: colors.danger + "22" }]}
            >
              <Feather name="trash-2" size={14} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {expense.notes ? (
        <Text style={[styles.notes, { color: colors.mutedForeground }]} numberOfLines={2}>
          {expense.notes}
        </Text>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderWidth: 1,
    borderRightWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  row: { flexDirection: "row-reverse", alignItems: "center", gap: 12 },
  categoryBadge: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
  },
  info: { flex: 1, alignItems: "flex-end" },
  nameRow: { flexDirection: "row-reverse", alignItems: "center", gap: 6, marginBottom: 4 },
  name: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold", textAlign: "right" },
  paidBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  paidText: { fontSize: 10, fontWeight: "600" },
  metaRow: { flexDirection: "row-reverse", gap: 6 },
  catChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  catText: { fontSize: 11, fontWeight: "500" },
  importanceDot: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  importanceText: { fontSize: 11, fontWeight: "500" },
  amountSection: { alignItems: "flex-end" },
  amount: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  currency: { fontSize: 11, marginTop: 2 },
  divider: { height: 1, marginVertical: 10 },
  footer: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" },
  deadlineSection: { flexDirection: "row-reverse", alignItems: "center", gap: 4 },
  deadline: { fontSize: 12, fontFamily: "Inter_400Regular" },
  actions: { flexDirection: "row-reverse", gap: 6 },
  actionBtn: {
    flexDirection: "row-reverse", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  actionText: { fontSize: 12, fontWeight: "600" },
  notes: { fontSize: 12, marginTop: 8, textAlign: "right", fontStyle: "italic" },
});
