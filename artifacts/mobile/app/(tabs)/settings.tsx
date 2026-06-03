import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassCard } from "@/components/GlassCard";
import { CURRENCIES } from "@/constants/quotes";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";

function SettingRow({
  icon,
  title,
  subtitle,
  children,
  color,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  color?: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
      <View style={styles.settingRight}>
        <View
          style={[
            styles.settingIconWrap,
            { backgroundColor: (color || colors.primary) + "22" },
          ]}
        >
          <Feather name={icon as any} size={16} color={color || colors.primary} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: colors.foreground }]}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.settingSubtitle, { color: colors.mutedForeground }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {children}
    </View>
  );
}

type ThemeOption = "light" | "dark" | "auto";

const THEME_OPTIONS: { value: ThemeOption; label: string; icon: string }[] = [
  { value: "light", label: "فاتح", icon: "sun" },
  { value: "dark", label: "داكن", icon: "moon" },
  { value: "auto", label: "تلقائي", icon: "smartphone" },
];

export default function SettingsScreen() {
  const colors = useColors();
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, clearAllData, income, expenses, goals, restartOnboarding } =
    useApp();
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const selectedCurrency = CURRENCIES.find((c) => c.code === settings.currency);

  const handleReset = () => {
    Alert.alert(
      "مسح جميع البيانات",
      "هل أنت متأكد؟ سيتم حذف جميع المصاريف والأهداف والدخل بشكل نهائي ولا يمكن التراجع.",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "مسح الكل",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  const handleTestNotification = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "✅ الإشعارات تعمل",
      "تم استلام الإشعار بنجاح! الإشعارات مفعّلة على جهازك.",
      [{ text: "حسناً" }]
    );
  };

  const handleReplayOnboarding = () => {
    Alert.alert(
      "إعادة الشرح",
      "هل تريد إعادة عرض شرح التطبيق من البداية؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "نعم، أعِد الشرح",
          onPress: async () => {
            await restartOnboarding();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ]
    );
  };

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
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>الإعدادات</Text>
            <Feather name="settings" size={22} color={colors.primary} />
          </View>

          <GlassCard style={styles.statsCard} padding={16}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNum, { color: colors.primary }]}>
                  {expenses.length}
                </Text>
                <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>
                  مصروف
                </Text>
              </View>
              <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statNum, { color: colors.accent }]}>
                  {goals.length}
                </Text>
                <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>
                  هدف
                </Text>
              </View>
              <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statNum, { color: colors.success }]}>
                  {income > 0 ? income.toLocaleString("ar-SA") : "---"}
                </Text>
                <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>
                  الدخل
                </Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              التفضيلات
            </Text>

            <SettingRow
              icon="dollar-sign"
              title="العملة"
              subtitle={selectedCurrency?.name || settings.currency}
              color={colors.accent}
            >
              <TouchableOpacity
                onPress={() => setShowCurrencyPicker(true)}
                style={[
                  styles.currencyBtn,
                  {
                    backgroundColor: colors.accent + "22",
                    borderColor: colors.accent + "44",
                  },
                ]}
              >
                <Text style={[styles.currencyBtnText, { color: colors.accent }]}>
                  {selectedCurrency?.symbol || settings.currency}
                </Text>
                <Feather name="chevron-left" size={14} color={colors.accent} />
              </TouchableOpacity>
            </SettingRow>

            <SettingRow
              icon="moon"
              title="مظهر التطبيق"
              subtitle="اختر بين الفاتح أو الداكن"
              color={colors.secondary}
            >
              <View style={styles.themeSelector}>
                {THEME_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => {
                      setTheme(opt.value);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.themeBtn,
                      {
                        backgroundColor:
                          theme === opt.value
                            ? colors.secondary + "33"
                            : colors.muted,
                        borderColor:
                          theme === opt.value ? colors.secondary : "transparent",
                      },
                    ]}
                  >
                    <Feather
                      name={opt.icon as any}
                      size={12}
                      color={
                        theme === opt.value
                          ? colors.secondary
                          : colors.mutedForeground
                      }
                    />
                    <Text
                      style={[
                        styles.themeBtnText,
                        {
                          color:
                            theme === opt.value
                              ? colors.secondary
                              : colors.mutedForeground,
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </SettingRow>

            <SettingRow
              icon="bell"
              title="الإشعارات"
              subtitle="تنبيهات المصاريف والأهداف"
              color={colors.primary}
            >
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(v) => updateSettings({ notificationsEnabled: v })}
                trackColor={{ false: colors.muted, true: colors.primary + "88" }}
                thumbColor={settings.notificationsEnabled ? colors.primary : colors.mutedForeground}
              />
            </SettingRow>

            <SettingRow
              icon="volume-2"
              title="الأصوات والاهتزاز"
              subtitle="صوت عند إضافة المصاريف"
              color={colors.success}
            >
              <Switch
                value={settings.soundEnabled}
                onValueChange={(v) => updateSettings({ soundEnabled: v })}
                trackColor={{ false: colors.muted, true: colors.success + "88" }}
                thumbColor={settings.soundEnabled ? colors.success : colors.mutedForeground}
              />
            </SettingRow>

            <SettingRow
              icon="shield"
              title="وضع الطوارئ"
              subtitle="تحذير مرئي عند كل إنفاق"
              color={colors.danger}
            >
              <Switch
                value={settings.emergencyMode}
                onValueChange={(v) => {
                  updateSettings({ emergencyMode: v });
                  if (v) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                }}
                trackColor={{ false: colors.muted, true: colors.danger + "88" }}
                thumbColor={settings.emergencyMode ? colors.danger : colors.mutedForeground}
              />
            </SettingRow>

            {settings.notificationsEnabled && (
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { backgroundColor: colors.primary + "18", borderColor: colors.primary + "44" },
                ]}
                onPress={handleTestNotification}
              >
                <Text style={[styles.actionBtnText, { color: colors.primary }]}>
                  اختبار الإشعارات
                </Text>
                <Feather name="bell" size={15} color={colors.primary} />
              </TouchableOpacity>
            )}
          </GlassCard>

          <GlassCard style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              المساعدة والبيانات
            </Text>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                { backgroundColor: colors.secondary + "18", borderColor: colors.secondary + "44" },
              ]}
              onPress={handleReplayOnboarding}
            >
              <Text style={[styles.actionBtnText, { color: colors.secondary }]}>
                إعادة شرح التطبيق
              </Text>
              <Feather name="help-circle" size={15} color={colors.secondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dangerBtn,
                { backgroundColor: colors.danger + "18", borderColor: colors.danger + "44" },
              ]}
              onPress={handleReset}
            >
              <Text style={[styles.dangerBtnText, { color: colors.danger }]}>
                مسح جميع البيانات
              </Text>
              <Feather name="trash-2" size={16} color={colors.danger} />
            </TouchableOpacity>
          </GlassCard>

          <GlassCard style={styles.aboutCard} padding={16}>
            <Text style={[styles.aboutTitle, { color: colors.foreground }]}>
              عقلية مالية
            </Text>
            <Text style={[styles.aboutSub, { color: colors.mutedForeground }]}>
              تحكّم بأموالك بذكاء وثقة
            </Text>
            <Text style={[styles.aboutVersion, { color: colors.mutedForeground }]}>
              الإصدار 1.0.0
            </Text>
          </GlassCard>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={showCurrencyPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCurrencyPicker(false)}
      >
        <View style={styles.overlay}>
          <View
            style={[
              styles.pickerSheet,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={[styles.pickerHandle, { backgroundColor: colors.border }]} />
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowCurrencyPicker(false)}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
              <Text style={[styles.pickerTitle, { color: colors.foreground }]}>
                اختر العملة
              </Text>
            </View>
            <ScrollView>
              {CURRENCIES.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  style={[
                    styles.currencyItem,
                    {
                      backgroundColor:
                        settings.currency === c.code ? colors.primary + "18" : "transparent",
                      borderBottomColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    updateSettings({ currency: c.code });
                    setShowCurrencyPicker(false);
                  }}
                >
                  <View style={styles.currencyItemRight}>
                    {settings.currency === c.code && (
                      <Feather name="check" size={16} color={colors.primary} />
                    )}
                    <Text
                      style={[
                        styles.currencyItemName,
                        {
                          color:
                            settings.currency === c.code ? colors.primary : colors.foreground,
                        },
                      ]}
                    >
                      {c.name}
                    </Text>
                  </View>
                  <Text style={[styles.currencyItemSymbol, { color: colors.mutedForeground }]}>
                    {c.symbol}
                  </Text>
                </TouchableOpacity>
              ))}
              <View style={{ height: 32 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  statsCard: { marginBottom: 16 },
  statsRow: { flexDirection: "row-reverse", alignItems: "center" },
  statItem: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 20, fontWeight: "800", fontFamily: "Inter_700Bold" },
  statLbl: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    textAlign: "center",
  },
  statDiv: { width: 1, height: 32 },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    textAlign: "right",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingRight: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  settingText: { alignItems: "flex-end", flex: 1 },
  settingTitle: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    textAlign: "right",
  },
  settingSubtitle: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    textAlign: "right",
  },
  currencyBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  currencyBtnText: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  themeSelector: { flexDirection: "row-reverse", gap: 6 },
  themeBtn: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 52,
  },
  themeBtnText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  actionBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
  },
  actionBtnText: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  dangerBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
  },
  dangerBtnText: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  aboutCard: { marginBottom: 16, alignItems: "center" },
  aboutTitle: {
    fontSize: 20,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  aboutSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 4,
  },
  aboutVersion: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  pickerSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "60%",
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  pickerHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
  },
  pickerHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  currencyItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  currencyItemRight: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  currencyItemName: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
  },
  currencyItemSymbol: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
