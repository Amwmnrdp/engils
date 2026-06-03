import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassCard } from "@/components/GlassCard";
import { SavingsGoal, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const GOAL_COLORS = [
  "#00D4FF",
  "#8B5CF6",
  "#FFB700",
  "#10B981",
  "#FF4B4B",
  "#EC4899",
  "#F97316",
  "#06B6D4",
];

function GoalCard({ goal }: { goal: SavingsGoal }) {
  const colors = useColors();
  const { deleteGoal, updateGoalSavings } = useApp();
  const progress =
    goal.targetAmount > 0
      ? Math.min(goal.savedAmount / goal.targetAmount, 1)
      : 0;
  const pct = Math.round(progress * 100);
  const remaining = goal.targetAmount - goal.savedAmount;
  const isComplete = goal.savedAmount >= goal.targetAmount;

  const handleAddSavings = () => {
    Alert.prompt(
      "إضافة مبلغ للهدف",
      `أدخل المبلغ الذي وفّرته لـ "${goal.name}"`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "إضافة",
          onPress: async (text?: string) => {
            const val = parseFloat(text || "0");
            if (val > 0) {
              await updateGoalSavings(goal.id, val);
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
            }
          },
        },
      ],
      "plain-text",
      "",
      "numeric"
    );
  };

  const handleDelete = () => {
    Alert.alert("حذف الهدف", `هل تريد حذف هدف "${goal.name}"؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => deleteGoal(goal.id),
      },
    ]);
  };

  return (
    <GlassCard style={[styles.goalCard, { borderColor: goal.color + "44", borderWidth: 1 }]}>
      <View style={styles.goalHeader}>
        <View style={styles.goalActions}>
          {!isComplete && (
            <TouchableOpacity
              onPress={handleAddSavings}
              style={[
                styles.addSavingsBtn,
                { backgroundColor: goal.color + "22", borderColor: goal.color + "55" },
              ]}
            >
              <Feather name="plus" size={14} color={goal.color} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleDelete}
            style={[
              styles.deleteGoalBtn,
              { backgroundColor: colors.danger + "22" },
            ]}
          >
            <Feather name="trash-2" size={14} color={colors.danger} />
          </TouchableOpacity>
        </View>
        <View style={styles.goalTitleSection}>
          {isComplete && (
            <View
              style={[
                styles.completeBadge,
                { backgroundColor: colors.success + "22" },
              ]}
            >
              <Feather name="check" size={12} color={colors.success} />
              <Text style={[styles.completeTxt, { color: colors.success }]}>
                مكتمل!
              </Text>
            </View>
          )}
          <Text style={[styles.goalName, { color: colors.foreground }]}>
            {goal.name}
          </Text>
        </View>
      </View>

      <View style={styles.goalAmounts}>
        <Text style={[styles.goalRemaining, { color: colors.mutedForeground }]}>
          متبقي: {remaining.toLocaleString("ar-SA")}
        </Text>
        <Text style={[styles.goalSaved, { color: goal.color }]}>
          {goal.savedAmount.toLocaleString("ar-SA")} / {goal.targetAmount.toLocaleString("ar-SA")}
        </Text>
      </View>

      <View
        style={[styles.goalProgressBar, { backgroundColor: colors.muted }]}
      >
        <View
          style={[
            styles.goalProgressFill,
            {
              width: `${pct}%`,
              backgroundColor: isComplete ? colors.success : goal.color,
            },
          ]}
        />
      </View>

      <View style={styles.goalFooter}>
        {goal.deadline ? (
          <Text style={[styles.goalDeadline, { color: colors.mutedForeground }]}>
            الهدف: {new Date(goal.deadline).toLocaleDateString("ar-SA")}
          </Text>
        ) : null}
        <Text style={[styles.goalPct, { color: goal.color }]}>{pct}٪</Text>
      </View>
    </GlassCard>
  );
}

function AddGoalModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const colors = useColors();
  const { addGoal } = useApp();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedColor, setSelectedColor] = useState(GOAL_COLORS[0]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("خطأ", "أدخل اسم الهدف");
      return;
    }
    const amt = parseFloat(target);
    if (!amt || amt <= 0) {
      Alert.alert("خطأ", "أدخل مبلغاً صحيحاً");
      return;
    }
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    await addGoal({
      name: name.trim(),
      targetAmount: amt,
      savedAmount: 0,
      deadline:
        deadline.trim() ||
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      color: selectedColor,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setName("");
    setTarget("");
    setDeadline("");
    setSelectedColor(GOAL_COLORS[0]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View
            style={[
              styles.sheet,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <View style={styles.sheetHeader}>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
                هدف ادخار جديد
              </Text>
            </View>
            <ScrollView
              style={styles.sheetScroll}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                اسم الهدف *
              </Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.foreground,
                  },
                ]}
                placeholder="مثال: سيارة جديدة"
                placeholderTextColor={colors.mutedForeground}
                value={name}
                onChangeText={setName}
                textAlign="right"
              />

              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                المبلغ المستهدف *
              </Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.foreground,
                  },
                ]}
                placeholder="0.00"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
                value={target}
                onChangeText={setTarget}
                textAlign="right"
              />

              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                الموعد (YYYY-MM-DD) اختياري
              </Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.foreground,
                  },
                ]}
                placeholder="2025-12-31"
                placeholderTextColor={colors.mutedForeground}
                value={deadline}
                onChangeText={setDeadline}
                textAlign="right"
              />

              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                اللون
              </Text>
              <View style={styles.colorRow}>
                {GOAL_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorDot,
                      {
                        backgroundColor: c,
                        borderWidth: selectedColor === c ? 3 : 0,
                        borderColor: colors.foreground,
                      },
                    ]}
                    onPress={() => setSelectedColor(c)}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                onPress={handleSubmit}
              >
                <Text
                  style={[styles.submitText, { color: colors.primaryForeground }]}
                >
                  إنشاء الهدف
                </Text>
              </TouchableOpacity>
              <View style={{ height: 32 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export default function GoalsScreen() {
  const colors = useColors();
  const { goals } = useApp();
  const [showAdd, setShowAdd] = useState(false);

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0);
  const completedCount = goals.filter(
    (g) => g.savedAmount >= g.targetAmount
  ).length;

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
            أهداف الادخار
          </Text>
          <Feather name="target" size={22} color={colors.primary} />
        </View>

        {goals.length > 0 && (
          <View
            style={[
              styles.summaryRow,
              { borderBottomColor: colors.border },
            ]}
          >
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>
                {goals.length}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                هدف
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.success }]}>
                {totalSaved.toLocaleString("ar-SA")}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                تم توفيره
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.accent }]}>
                {completedCount}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                مكتمل
              </Text>
            </View>
          </View>
        )}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {goals.length === 0 ? (
            <View style={styles.empty}>
              <Feather
                name="target"
                size={56}
                color={colors.mutedForeground}
                style={{ opacity: 0.4, marginBottom: 16 }}
              />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                لا توجد أهداف بعد
              </Text>
              <Text
                style={[
                  styles.emptySubtitle,
                  { color: colors.mutedForeground },
                ]}
              >
                ابدأ بتحديد هدف ادخار وتتبع تقدمك
              </Text>
              <TouchableOpacity
                style={[
                  styles.emptyAddBtn,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => setShowAdd(true)}
              >
                <Feather
                  name="plus"
                  size={18}
                  color={colors.primaryForeground}
                />
                <Text
                  style={[
                    styles.emptyAddText,
                    { color: colors.primaryForeground },
                  ]}
                >
                  إنشاء هدف
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            goals.map((goal) => <GoalCard key={goal.id} goal={goal} />)
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      {goals.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowAdd(true);
          }}
        >
          <Feather name="plus" size={26} color={colors.primaryForeground} />
        </TouchableOpacity>
      )}

      <AddGoalModal visible={showAdd} onClose={() => setShowAdd(false)} />
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
  divider: { width: 1, marginHorizontal: 8 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyAddBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  emptyAddText: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  goalCard: { marginBottom: 14, borderWidth: 1 },
  goalHeader: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  goalTitleSection: { alignItems: "flex-end", flex: 1 },
  goalName: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  completeBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 4,
  },
  completeTxt: { fontSize: 11, fontWeight: "600" },
  goalActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  addSavingsBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  deleteGoalBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  goalAmounts: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  goalSaved: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  goalRemaining: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  goalProgressBar: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 6,
  },
  goalProgressFill: {
    height: "100%",
    borderRadius: 5,
  },
  goalFooter: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalDeadline: { fontSize: 11, fontFamily: "Inter_400Regular" },
  goalPct: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
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
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  keyboardView: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "90%",
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
  },
  sheetHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  sheetScroll: { paddingHorizontal: 20 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
    textAlign: "right",
    fontFamily: "Inter_500Medium",
  },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    marginBottom: 16,
    fontFamily: "Inter_400Regular",
  },
  colorRow: {
    flexDirection: "row-reverse",
    gap: 10,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  submitBtn: {
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitText: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
});
