import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const { width: SCREEN_W } = Dimensions.get("window");

interface Step {
  icon: string;
  iconBg: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    icon: "zap",
    iconBg: "#005EFF",
    title: "مرحباً بك في عقلية مالية",
    description:
      "تطبيقك الذكي لإدارة أموالك الشخصية بطريقة مبسطة وشفافة. سنشرح لك كيف يعمل التطبيق خطوة بخطوة في ثوانٍ.",
  },
  {
    icon: "home",
    iconBg: "#00D4FF",
    title: "الشاشة الرئيسية — رصيدك دائماً أمامك",
    description:
      "أدخل دخلك الشهري مرة واحدة وستظهر لك الدائرة الملوّنة التي تُظهر نسبة ما صرفته:\n\n🟢 أخضر = أقل من 50% — ممتاز\n🟡 أصفر = 50–75% — جيد\n🟠 برتقالي = 75–90% — تنبّه\n🔴 أحمر = أكثر من 90% — خطر",
  },
  {
    icon: "credit-card",
    iconBg: "#FF6B6B",
    title: "المصاريف — سجّل كل ريال",
    description:
      "اضغط على زر + الأزرق في الزاوية لإضافة مصروف جديد.\n\nحدد:\n• الاسم والمبلغ\n• الفئة (طعام، تسوق، فواتير...)\n• الأهمية: عادي / متوسط / مهم\n• تاريخ الاستحقاق\n\nعند الدفع، اضغط \"دفع\" على المصروف ليتحوّل للمدفوع.",
  },
  {
    icon: "bar-chart-2",
    iconBg: "#8B5CF6",
    title: "التحليل — فهم أين يذهب مالك",
    description:
      "صفحة التحليل تُظهر لك:\n\n📊 رسم دائري بتوزيع مصاريفك على الفئات\n📈 نسبة ادخارك الشهري\n⏰ عدد المصاريف المستحقة قريباً\n\nافتح هذه الصفحة دورياً لتعرف أين تنفق أكثر.",
  },
  {
    icon: "target",
    iconBg: "#10B981",
    title: "الأهداف — خطط لمستقبلك",
    description:
      "أنشئ أهداف ادخارية مثل:\n• شراء سيارة\n• رحلة سفر\n• صندوق طوارئ\n\nحدد المبلغ المستهدف والموعد، وتابع تقدمك نحو الهدف. كل مبلغ تضيفه يُحدّث شريط التقدم تلقائياً.",
  },
  {
    icon: "check-circle",
    iconBg: "#FFB700",
    title: "أنت جاهز تماماً!",
    description:
      "يمكنك إعادة عرض هذا الشرح في أي وقت من:\nالإعدادات ← إعادة الشرح\n\nابدأ الآن باضغط زر + في الشاشة الرئيسية وسجّل أول مصروف لك. حظاً موفقاً! 🎯",
  },
];

interface OnboardingModalProps {
  visible: boolean;
  onFinish: () => void;
}

export function OnboardingModal({ visible, onFinish }: OnboardingModalProps) {
  const colors = useColors();
  const [step, setStep] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goTo = (next: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    setStep(next);
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      goTo(step + 1);
    } else {
      onFinish();
    }
  };

  const handlePrev = () => {
    if (step > 0) goTo(step - 1);
  };

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <Modal visible={visible} animationType="fade" transparent={false} statusBarTranslucent>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={
            colors.isDark
              ? ["#070D1B", "#0A1628", "#070D1B"]
              : ["#EEF2FF", "#E0E8FF", "#EEF2FF"]
          }
          style={StyleSheet.absoluteFill}
        />

        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
          <View style={styles.header}>
            <Text style={[styles.stepCounter, { color: colors.mutedForeground }]}>
              {step + 1} / {STEPS.length}
            </Text>
            <TouchableOpacity onPress={onFinish} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={[styles.skipText, { color: colors.mutedForeground }]}>تخطّى</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dotsRow}>
            {STEPS.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => goTo(i)}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        i === step ? current.iconBg : colors.muted,
                      width: i === step ? 24 : 8,
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: current.iconBg + "22", borderColor: current.iconBg + "55" },
              ]}
            >
              <View
                style={[styles.iconInner, { backgroundColor: current.iconBg }]}
              >
                <Feather name={current.icon as any} size={36} color="#FFFFFF" />
              </View>
            </View>

            <Text style={[styles.title, { color: colors.foreground }]}>
              {current.title}
            </Text>

            <ScrollView
              style={styles.descScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.descScrollContent}
            >
              <Text style={[styles.description, { color: colors.foreground }]}>
                {current.description}
              </Text>
            </ScrollView>
          </Animated.View>

          <View style={styles.buttons}>
            {step > 0 ? (
              <TouchableOpacity
                onPress={handlePrev}
                style={[styles.prevBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
              >
                <Feather name="chevron-right" size={20} color={colors.foreground} />
                <Text style={[styles.prevText, { color: colors.foreground }]}>السابق</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.prevBtn} />
            )}

            <TouchableOpacity
              onPress={handleNext}
              style={[styles.nextBtn, { backgroundColor: current.iconBg }]}
            >
              <Text style={styles.nextText}>
                {isLast ? "ابدأ الآن!" : "التالي"}
              </Text>
              {!isLast && <Feather name="chevron-left" size={20} color="#FFF" />}
              {isLast && <Feather name="zap" size={18} color="#FFF" />}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  stepCounter: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  skipText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  dotsRow: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  iconInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 32,
  },
  descScroll: {
    maxHeight: 220,
    width: "100%",
  },
  descScrollContent: {
    paddingBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 26,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
  buttons: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 12,
    paddingTop: 16,
    gap: 12,
  },
  prevBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 100,
    justifyContent: "center",
  },
  prevText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  nextBtn: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  nextText: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
});
