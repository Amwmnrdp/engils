import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { I18nManager, Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeContext";

if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

function AppStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

function AppShell() {
  if (Platform.OS === "web") {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppStack />
      </GestureHandlerRootView>
    );
  }

  try {
    const { KeyboardProvider } =
      require("react-native-keyboard-controller") as typeof import("react-native-keyboard-controller");
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <AppStack />
        </KeyboardProvider>
      </GestureHandlerRootView>
    );
  } catch (e) {
    if (__DEV__) console.warn("[Layout] KeyboardProvider unavailable:", e);
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppStack />
      </GestureHandlerRootView>
    );
  }
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      if (cancelled) return;
      setAppReady(true);
      try {
        await SplashScreen.hideAsync();
      } catch {
        // Already hidden or never prevented — safe to ignore.
      }
    }

    if (fontsLoaded || fontError) {
      finish();
      return;
    }

    const timer = setTimeout(() => {
      if (__DEV__) console.warn("[Layout] Font loading timed out — using system fonts");
      finish();
    }, 3000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [fontsLoaded, fontError]);

  if (!appReady) {
    return <View style={{ flex: 1, backgroundColor: "#EEF2FF" }} />;
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <AppProvider>
              <AppShell />
            </AppProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
