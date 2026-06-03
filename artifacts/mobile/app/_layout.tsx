import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as NavigationBar from "expo-navigation-bar";
import * as Notifications from "expo-notifications";
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

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowAlert: true,
  }),
});

const queryClient = new QueryClient();

async function setupApp() {
  if (Platform.OS === "android") {
    try {
      await NavigationBar.setVisibilityAsync("hidden");
    } catch (e) {
      if (__DEV__) console.warn("[Layout] NavigationBar setup failed:", e);
    }
  }

  try {
    const result = await Notifications.requestPermissionsAsync() as any;
    if (__DEV__) console.log("[Notifications] Permission:", result.granted ?? result.status);
  } catch (e) {
    if (__DEV__) console.warn("[Notifications] Permission request failed:", e);
  }
}

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
      await setupApp();
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
