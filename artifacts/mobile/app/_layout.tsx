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

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

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
    console.warn("[Layout] KeyboardProvider unavailable, falling back:", e);
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
    async function hideSplash() {
      try {
        await SplashScreen.hideAsync();
      } catch {
        // splash may already be hidden
      }
    }

    if (fontsLoaded || fontError) {
      setAppReady(true);
      hideSplash();
      return;
    }

    // Safety: force show the app after 2.5 s even if fonts never resolve
    const timer = setTimeout(() => {
      console.warn("[Layout] Font loading timed out — rendering with fallback fonts");
      setAppReady(true);
      hideSplash();
    }, 2500);

    return () => clearTimeout(timer);
  }, [fontsLoaded, fontError]);

  // Return a solid background view (never null) so there is NO white screen
  // while fonts are loading. The splash screen covers this during normal startup.
  if (!appReady) {
    return <View style={{ flex: 1, backgroundColor: "#ffffff" }} />;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <AppShell />
          </AppProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
