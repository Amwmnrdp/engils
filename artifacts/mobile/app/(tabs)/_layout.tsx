import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React, { useState } from "react";
import { Platform, StyleSheet } from "react-native";

import { OnboardingModal } from "@/components/OnboardingModal";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function TabLayoutInner() {
  const colors = useColors();
  const { settings, completeOnboarding, isLoaded } = useApp();
  const isIOS = Platform.OS === "ios";

  const showOnboarding = isLoaded && !settings.onboardingCompleted;

  const handleFinishOnboarding = async () => {
    await completeOnboarding();
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
              <Feather name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="expenses"
          options={{
            title: "المصاريف",
            tabBarIcon: ({ color, size }) => (
              <Feather name="credit-card" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: "التحليل",
            tabBarIcon: ({ color, size }) => (
              <Feather name="bar-chart-2" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="goals"
          options={{
            title: "الأهداف",
            tabBarIcon: ({ color, size }) => (
              <Feather name="target" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "الإعدادات",
            tabBarIcon: ({ color, size }) => (
              <Feather name="settings" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      <OnboardingModal
        visible={showOnboarding}
        onFinish={handleFinishOnboarding}
      />
    </>
  );
}

export default function TabLayout() {
  return <TabLayoutInner />;
}
