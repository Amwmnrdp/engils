import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Circle, Defs, Mask, Rect, Svg } from "react-native-svg";

import { useColors } from "@/hooks/useColors";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const TAB_BAR_H = Platform.OS === "ios" ? 84 : 64;
const TAB_Y = SCREEN_H - TAB_BAR_H / 2;

interface StepConfig {
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  spotX: number;
  spotY: number;
  spotR: number;
  textPosition: "top" | "bottom";
}

const STEPS: StepConfig[] = [
  {
    icon: "zap",
    iconColor: "#005EFF",
    title: "مرحباً بك في عقلية مالية",
    description: "تطبيقك الذكي لإدارة أموالك الشخصية.\nسنشرح لك كيف يعمل خطوة بخطوة.",
    spotX: SCREEN_W * 0.5,
    spotY: SCREEN_H * 0.38,
    spotR: 130,
    textPosition: "bottom",
  },
  {
    icon: "home",
    iconColor: "#00D4FF",
    title: "الشاشة الرئيسية",
    description: "الدائرة الملوّنة تُظهر نسبة ما صرفته:\n🟢 أقل من 50% — ممتاز\n🟡 50–75% — جيد\n🟠 75–90% — تنبّه\n🔴 أكثر من 90% — خطر",
    spotX: SCREEN_W * 0.5,
    spotY: SCREEN_H * 0.38,
    spotR: 110,
    textPosition: "bottom",
  },
  {
    icon: "credit-card",
    iconColor: "#FF6B6B",
    title: "المصاريف",
    description: "اضغط + لإضافة مصروف جديد.\nحدد الاسم والمبلغ والفئة والأهمية.",
    spotX: SCREEN_W * 0.7,
    spotY: TAB_Y,
    spotR: 48,
    textPosition: "top",
  },
  {
    icon: "bar-chart-2",
    iconColor: "#8B5CF6",
    title: "التحليل",
    description: "رسم دائري بتوزيع مصاريفك،\ونسبة ادخارك، والمصاريف المستحقة قريباً.",
    spotX: SCREEN_W * 0.5,
    spotY: TAB_Y,
    spotR: 48,
    textPosition: "top",
  },
  {
    icon: "target",
    iconColor: "#10B981",
    title: "الأهداف",
    description: "أنشئ أهدافاً ادخارية مثل سيارة أو رحلة،\nوتابع تقدمك نحو كل هدف.",
    spotX: SCREEN_W * 0.3,
    spotY: TAB_Y,
    spotR: 48,
    textPosition: "top",
  },
  {
    icon: "check-circle",
    iconColor: "#FFB700",
    title: "أنت جاهز تماماً! 🎯",
    description: "يمكنك إعادة هذا الشرح في أي وقت من:\nالإعدادات ← إعادة شرح التطبيق",
    spotX: SCREEN_W * 0.5,
    spotY: SCREEN_H * 0.42,
    spotR: 90,
    textPosition: "bottom",
  },
];

interface OnboardingModalProps {
  visible: boolean;
  onFinish: () => void;
}

export function OnboardingModal({ visible, onFinish }: OnboardingModalProps) {
  const colors = useColors();
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cardSlideAnim = useRef(new Animated.Value(30)).current;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }
  }, [visible]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [step]);

  const goTo = (next: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(cardSlideAnim, { toValue: 20, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      cardSlideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(cardSlideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) goTo(step + 1);
    else onFinish();
  };

  const handlePrev = () => {
    if (step > 0) goTo(step - 1);
  };

  const cardAbove = current.textPosition === "top";
  const cardY = cardAbove
    ? current.spotY - current.spotR - 20
    : current.spotY + current.spotR + 20;

  const cardMaxH = cardAbove ? cardY - 20 : SCREEN_H - cardY - 20;

  return (
    <Modal visible={visible} animationType="none" transparent statusBarTranslucent>
      <Animated.View style={[styles.root, { opacity: fadeAnim }]}>
        {/* Dark overlay with spotlight hole via SVG mask */}
        <Svg
          width={SCREEN_W}
          height={SCREEN_H}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <Defs>
            <Mask id="mask">
              <Rect width={SCREEN_W} height={SCREEN_H} fill="white" />
              <Circle
                cx={current.spotX}
                cy={current.spotY}
                r={current.spotR}
                fill="black"
              />
            </Mask>
          </Defs>
          <Rect
            width={SCREEN_W}
            height={SCREEN_H}
            fill="rgba(0,0,0,0.78)"
            mask="url(#mask)"
          />
        </Svg>

        {/* Glowing ring around spotlight */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.spotlight,
            {
              width: current.spotR * 2,
              height: current.spotR * 2,
              borderRadius: current.spotR,
              borderColor: current.iconColor + "CC",
              left: current.spotX - current.spotR,
              top: current.spotY - current.spotR,
              transform: [{ scale: pulseAnim }],
              shadowColor: current.iconColor,
            },
          ]}
        />

        {/* Info card */}
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.isDark ? "#111827" : "#FFFFFF",
              borderColor: current.iconColor + "55",
              left: 20,
              right: 20,
              top: cardAbove ? Math.max(10, cardY - 180) : undefined,
              bottom: cardAbove ? undefined : Math.max(10, SCREEN_H - cardY - 180),
              transform: [
                { translateY: cardAbove ? cardSlideAnim : Animated.multiply(cardSlideAnim, -1) as any },
              ],
            },
          ]}
        >
          {/* Icon */}
          <View style={[styles.iconWrap, { backgroundColor: current.iconColor + "22" }]}>
            <View style={[styles.iconInner, { backgroundColor: current.iconColor }]}>
              <Feather name={current.icon as any} size={22} color="#FFF" />
            </View>
          </View>

          <Text style={[styles.cardTitle, { color: colors.foreground }]}>
            {current.title}
          </Text>
          <Text style={[styles.cardDesc, { color: colors.mutedForeground ?? "#888" }]}>
            {current.description}
          </Text>

          {/* Dots */}
          <View style={styles.dotsRow}>
            {STEPS.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => goTo(i)}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: i === step ? current.iconColor : "#44444466",
                      width: i === step ? 20 : 7,
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Buttons */}
          <View style={styles.btnRow}>
            {step > 0 ? (
              <TouchableOpacity
                onPress={handlePrev}
                style={[styles.prevBtn, { borderColor: colors.border ?? "#ddd" }]}
              >
                <Feather name="chevron-right" size={18} color={colors.foreground} />
                <Text style={[styles.prevText, { color: colors.foreground }]}>السابق</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={onFinish} style={styles.skipBtn}>
                <Text style={[styles.skipText, { color: colors.mutedForeground ?? "#888" }]}>تخطّى</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleNext}
              style={[styles.nextBtn, { backgroundColor: current.iconColor }]}
            >
              <Text style={styles.nextBtnText}>{isLast ? "ابدأ الآن!" : "التالي"}</Text>
              <Feather name={isLast ? "zap" : "chevron-left"} size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  spotlight: {
    position: "absolute",
    borderWidth: 2.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 0,
  },
  card: {
    position: "absolute",
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  iconInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 22,
    textAlign: "right",
    fontFamily: "Inter_400Regular",
    marginBottom: 14,
  },
  dotsRow: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: 5,
    marginBottom: 14,
  },
  dot: {
    height: 7,
    borderRadius: 3.5,
  },
  btnRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  prevBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  prevText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  skipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  nextBtn: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    color: "#FFF",
  },
});
