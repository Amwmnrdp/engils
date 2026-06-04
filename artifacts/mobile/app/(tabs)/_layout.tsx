import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router, Tabs } from "expo-router";
import React, { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";

import { OnboardingModal, TUTORIAL_STEPS, TutorialTab } from "@/components/OnboardingModal";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

// Which tutorial step first introduces each tab
const TAB_INTRO_STEP: Record<string, number> = {
  expenses: 2,
  analytics: 3,
  goals: 4,
};

function TabIcon({
  name,
  color,
  size,
  tabName,
  tutorialStep,
  showOnboarding,
}: {
  name: string;
  color: string;
  size: number;
  tabName: string;
  tutorialStep: number;
  showOnboarding: boolean;
}) {
  const introStep = TAB_INTRO_STEP[tabName];
  const hasBadge =
    showOnboarding && introStep !== undefined && tutorialStep < introStep;

  return (
    <View style={badgeStyles.wrap}>
      <Feather name={name as any} size={size} color={color} />
      {hasBadge && (
        <View style={badgeStyles.dot} />
      )}
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  wrap: {
    position: "relative",
  },
  dot: {
    position: "absolute",
    top: -3,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4B4B",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
});

function TabLayoutInner() {
  const colors = useColors();
  const { settings, completeOnboarding, isLoaded } = useApp();
  const isIOS = Platform.OS === "ios";
  const [tutorialStep, setTutorialStep] = useState(0);

  const showOnboarding = isLoaded && !settings.onboardingCompleted;

  const handleFinishOnboarding = async () => {
    await completeOnboarding();
  };

  const handleNavigate = (tab: TutorialTab) => {
    const routes: Record<TutorialTab, string> = {
      index: "/(tabs)/",
      expenses: "/(tabs)/expenses",
      analytics: "/(tabs)/analytics",
      goals: "/(tabs)/goals",
    };
    router.push(routes[tab] as any);
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.mutedForeground,
          tabBarLabelStyle: {
            fontSize: 11,
            fontFamily: "Inter_500Medium",
            marginBottom: isIOS ? 0 : 4,
          },
          tabBarStyle: {
            position: "absolute",
            backgroundColor: isIOS ? "transparent" : colors.surface,
            borderTopWidth: 0,
            elevation: 0,
            height: isIOS ? 84 : 64,
            borderTopColor: colors.border,
          },
          tabBarBackground: () =>
            isIOS ? (
              <BlurView
                intensity={80}
                tint={colors.isDark ? "dark" : "light"}
                style={[StyleSheet.absoluteFill, { borderTopWidth: 0 }]}
              />
            ) : null,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "الرئيسية",
            tabBarIcon: ({ color, size }) => (
              <TabIcon
                name="home"
                color={color}
                size={size}
                tabName="index"
                tutorialStep={tutorialStep}
                showOnboarding={showOnboarding}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="expenses"
          options={{
            title: "المصاريف",
            tabBarIcon: ({ color, size }) => (
              <TabIcon
                name="credit-card"
                color={color}
                size={size}
                tabName="expenses"
                tutorialStep={tutorialStep}
                showOnboarding={showOnboarding}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: "التحليل",
            tabBarIcon: ({ color, size }) => (
              <TabIcon
                name="bar-chart-2"
                color={color}
                size={size}
                tabName="analytics"
                tutorialStep={tutorialStep}
                showOnboarding={showOnboarding}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="goals"
          options={{
            title: "الأهداف",
            tabBarIcon: ({ color, size }) => (
              <TabIcon
                name="target"
                color={color}
                size={size}
                tabName="goals"
                tutorialStep={tutorialStep}
                showOnboarding={showOnboarding}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "الإعدادات",
            tabBarIcon: ({ color, size }) => (
              <TabIcon
                name="settings"
                color={color}
                size={size}
                tabName="settings"
                tutorialStep={tutorialStep}
                showOnboarding={showOnboarding}
              />
            ),
          }}
        />
      </Tabs>

      <OnboardingModal
        visible={showOnboarding}
        onFinish={handleFinishOnboarding}
        onNavigate={handleNavigate}
        onStepChange={setTutorialStep}
      />
    </>
  );
}

export default function TabLayout() {
  return <TabLayoutInner />;
}
