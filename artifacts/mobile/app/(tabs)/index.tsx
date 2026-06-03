import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
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

import { AIInsightPanel } from "@/components/AIInsightPanel";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { GlassCard } from "@/components/GlassCard";
import { ScoreRing } from "@/components/ScoreRing";
import { getDailyQuote } from "@/constants/quotes";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const {
    income,
    setIncome,
    totalSpent,
    remainingBalance,
    spentPercent,
    aiInsights,
    expenses,
    settings,
    nextMonthTotal,
    nextMonthBalance,
  } = useApp();

  const [incomeInput, setIncomeInput] = useState("");
  const [showAddExpense, setShowAddExpense] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const orb1Y = useRef(new Animated.Value(0)).current;
  const orb2Y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Y, { toValue: -18, duration: 3500, useNativeDriver: true }),
        Animated.timing(orb1Y, { toValue: 0, duration: 3500, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Y, { toValue: 15, duration: 4200, useNativeDriver: true }),
        Animated.timing(orb2Y, { toValue: 0, duration: 4200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleSetIncome = async () => {
    const val = parseFloat(incomeInput);
    if (val > 0) {
      await setIncome(val);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const quote = getDailyQuote();
  const today = new Date();
  const dateStr = today.toLocaleDateString("ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const recentExpenses = expenses.filter((e) => !e.paid).slice(0, 3);

  const spentColor =
    spentPercent < 50
      ? colors.success
      : spentPercent < 75
      ? colors.warning
      : spentPercent < 90
      ? "#FF9800"
      : colors.danger;

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

      <Animated.View
        style={[
          styles.orb1,
          { backgroundColor: colors.primary + "22", transform: [{ translateY: orb1Y }] },
        ]}
      />
      <Animated.View
        style={[
          styles.orb2,
          { backgroundColor: colors.secondary + "18", transform: [{ translateY: orb2Y }] },
        ]}
      />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          >
            <View style={styles.topBar}>
              <View style={styles.greetingBlock}>
                <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
                  {dateStr}
                </Text>
                <Text style={[styles.greeting, { color: colors.foreground }]}>
                  عقلية مالية 💰
                </Text>
              </View>
            </View>

            {income > 0 ? (
              <GlassCard style={styles.balanceCard} padding={0}>
                <LinearGradient
                  colors={
                    colors.isDark
                      ? ["#00D4FF18", "#8B5CF618", "#00D4FF08"]
                      : ["#005EFF18", "#7C3AED18", "#005EFF08"]
                  }
                  style={[styles.balanceGradient, { borderRadius: colors.radius }]}
                >
                  <View style={styles.balanceTop}>
                    <View style={styles.ringWrapper}>
                      <ScoreRing spentPercent={spentPercent} size={100} />
                      <Text style={[styles.ringLabel, { color: colors.mutedForeground }]}>
                        من الدخل
                      </Text>
                    </View>
                    <View style={styles.balanceRight}>
                      <Text style={[styles.balanceLabel, { color: colors.mutedForeground }]}>
                        الرصيد المتبقي
                      </Text>
                      <AnimatedNumber
                        value={remainingBalance}
                        currency={settings.currency}
                        style={StyleSheet.flatten([
                          styles.balanceAmount,
                          {
                            color: remainingBalance < 0 ? colors.danger : colors.foreground,
                          },
                        ])}
                      />
                      <View style={styles.balanceMeta}>
                        <View style={styles.metaItem}>
                          <Feather name="arrow-down-circle" size={12} color={colors.danger} />
                          <Text style={[styles.metaValue, { color: colors.danger }]}>
                            {totalSpent.toLocaleString("ar-SA")}
                          </Text>
                          <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>
                            مصاريف
                          </Text>
                        </View>
                        <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.metaItem}>
                          <Feather name="arrow-up-circle" size={12} color={colors.success} />
                          <Text style={[styles.metaValue, { color: colors.success }]}>
                            {income.toLocaleString("ar-SA")}
                          </Text>
                          <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>
                            دخل
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={[styles.progressPct, { color: spentColor, fontWeight: "700" }]}>
                        {Math.round(spentPercent)}٪ تم إنفاقه
                      </Text>
                      <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
                        نسبة الإنفاق من الدخل
                      </Text>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
                      <LinearGradient
                        colors={
                          spentPercent > 90
                            ? ["#FF4B4B", "#FF8B8B"]
                            : spentPercent > 75
                            ? ["#FF9800", "#FFB74D"]
                            : spentPercent > 50
                            ? ["#FFB700", "#FFD966"]
                            : [colors.success, "#4ADE80"]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressFill, { width: `${Math.max(spentPercent, 2)}%` }]}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => setIncome(0)}
                    style={styles.changeIncomeBtn}
                  >
                    <Feather name="edit-2" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.changeIncomeTxt, { color: colors.mutedForeground }]}>
                      تغيير الدخل
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </GlassCard>
            ) : (
              <GlassCard style={styles.incomeCard}>
                <Text style={[styles.incomeTitle, { color: colors.foreground }]}>
                  ما هو دخلك الشهري؟
                </Text>
                <Text style={[styles.incomeSubtitle, { color: colors.mutedForeground }]}>
                  أدخل دخلك الشهري لنبدأ تتبع مصاريفك وإدارة أموالك بذكاء
                </Text>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                  <TextInput
                    style={[
                      styles.incomeInput,
                      {
                        backgroundColor: colors.input,
                        borderColor: colors.border,
                        color: colors.foreground,
                      },
                    ]}
                    placeholder="مثال: 5000"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="numeric"
                    value={incomeInput}
                    onChangeText={setIncomeInput}
                    textAlign="center"
                  />
                  <TouchableOpacity
                    style={[styles.startBtn, { backgroundColor: colors.primary }]}
                    onPress={handleSetIncome}
                  >
                    <Feather name="check" size={18} color={colors.primaryForeground} />
                    <Text style={[styles.startBtnText, { color: colors.primaryForeground }]}>
                      ابدأ المتابعة
                    </Text>
                  </TouchableOpacity>
                </KeyboardAvoidingView>
              </GlassCard>
            )}

            {income > 0 && nextMonthTotal > 0 && (
              <GlassCard style={styles.nextMonthCard} padding={14}>
                <View style={styles.nextMonthHeader}>
                  <Feather name="calendar" size={14} color={colors.primary} />
                  <Text style={[styles.nextMonthTitle, { color: colors.mutedForeground }]}>
                    توقعات الشهر القادم
                  </Text>
                </View>
                <View style={styles.nextMonthRow}>
                  <Text style={[styles.nextMonthSub, { color: colors.mutedForeground }]}>
                    مصاريف مجدولة: {nextMonthTotal.toLocaleString("ar-SA")} {settings.currency}
                  </Text>
                  <View style={styles.nextMonthBadge}>
                    <Feather
                      name={nextMonthBalance >= 0 ? "check-circle" : "alert-circle"}
                      size={13}
                      color={nextMonthBalance >= 0 ? colors.success : colors.danger}
                    />
                    <Text style={[
                      styles.nextMonthBalance,
                      { color: nextMonthBalance >= 0 ? colors.success : colors.danger },
                    ]}>
                      {nextMonthBalance >= 0 ? "+" : ""}{nextMonthBalance.toLocaleString("ar-SA")} {settings.currency}
                    </Text>
                  </View>
                </View>
              </GlassCard>
            )}

            <GlassCard style={styles.quoteCard} padding={14}>
              <View style={styles.quoteRow}>
                <Text style={[styles.quoteText, { color: colors.foreground }]}>
                  {quote}
                </Text>
                <View style={[styles.quoteIcon, { backgroundColor: colors.accent + "22" }]}>
                  <Feather name="zap" size={16} color={colors.accent} />
                </View>
              </View>
            </GlassCard>

            {aiInsights.length > 0 && (
              <View style={styles.section}>
                <AIInsightPanel insights={aiInsights} />
              </View>
            )}

            {recentExpenses.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Feather name="clock" size={14} color={colors.mutedForeground} />
                  <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
                    مصاريف غير مدفوعة
                  </Text>
                </View>
                {recentExpenses.map((exp) => (
                  <View
                    key={exp.id}
                    style={[
                      styles.miniExpense,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        borderRadius: colors.radius / 2,
                      },
                    ]}
                  >
                    <Text style={[styles.miniAmount, { color: colors.danger }]}>
                      {exp.amount.toLocaleString("ar-SA")} {settings.currency}
                    </Text>
                    <Text
                      style={[styles.miniName, { color: colors.foreground }]}
                      numberOfLines={1}
                    >
                      {exp.name}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {settings.emergencyMode && (
              <View
                style={[
                  styles.emergencyBanner,
                  { backgroundColor: colors.danger + "22", borderColor: colors.danger },
                ]}
              >
                <Feather name="shield" size={16} color={colors.danger} />
                <Text style={[styles.emergencyText, { color: colors.danger }]}>
                  وضع الطوارئ مفعّل — كن حذراً في كل إنفاق
                </Text>
              </View>
            )}

            <View style={{ height: 100 }} />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setShowAddExpense(true);
        }}
      >
        <Feather name="plus" size={26} color={colors.primaryForeground} />
      </TouchableOpacity>

      <AddExpenseModal
        visible={showAddExpense}
        onClose={() => setShowAddExpense(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  orb1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -80,
    right: -80,
  },
  orb2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: 200,
    left: -60,
  },
  topBar: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
    marginTop: 8,
  },
  greetingBlock: { alignItems: "flex-end" },
  greeting: {
    fontSize: 24,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  dateText: {
    fontSize: 12,
    textAlign: "right",
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  balanceCard: { marginBottom: 14 },
  balanceGradient: { padding: 18 },
  balanceTop: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  ringWrapper: { alignItems: "center", gap: 4 },
  ringLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  balanceRight: { flex: 1, alignItems: "flex-end" },
  balanceLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
    textAlign: "right",
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  balanceMeta: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  metaLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  metaDivider: { width: 1, height: 20 },
  progressSection: { marginTop: 4 },
  progressHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  progressPct: { fontSize: 13, fontFamily: "Inter_700Bold" },
  progressBar: { height: 10, borderRadius: 5, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 5 },
  changeIncomeBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-end",
    marginTop: 10,
  },
  changeIncomeTxt: { fontSize: 11, fontFamily: "Inter_400Regular" },
  incomeCard: { marginBottom: 14 },
  incomeTitle: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginBottom: 8,
  },
  incomeSubtitle: {
    fontSize: 13,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
    lineHeight: 20,
  },
  incomeInput: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 14,
    fontFamily: "Inter_700Bold",
    fontSize: 32,
  },
  startBtn: {
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: 8,
  },
  startBtnText: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  nextMonthCard: { marginBottom: 14 },
  nextMonthHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  nextMonthTitle: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
  },
  nextMonthRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nextMonthSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    flex: 1,
  },
  nextMonthBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  nextMonthBalance: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  quoteCard: { marginBottom: 14 },
  quoteRow: { flexDirection: "row-reverse", alignItems: "center", gap: 10 },
  quoteIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  quoteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "right",
    fontFamily: "Inter_500Medium",
    fontStyle: "italic",
  },
  section: { marginBottom: 14 },
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    textAlign: "right",
  },
  miniExpense: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    marginBottom: 6,
  },
  miniName: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    flex: 1,
    textAlign: "right",
  },
  miniAmount: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  emergencyBanner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  emergencyText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    flex: 1,
    textAlign: "right",
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
