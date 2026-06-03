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

// ─── RTL: only call forceRTL when the current direction is NOT already RTL.
// Calling forceRTL(true) when isRTL is already true is a no-op, but calling
// it when isRTL is false triggers a bundle reload on Android standalone APKs.
// Without this guard the app reloads once per fresh install, and the race with
// SplashScreen.preventAutoHideAsync() leaves the splash stuck forever.
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
  // The OS will restart the JS bundle once after this. That restart is normal;
  // on the second boot isRTL will already be true so this branch is skipped.
}

// Prevent the splash from auto-hiding. We call it here so it is registered
// as early as possible (before any async work). Errors are swallowed so a
// failure here does not block the app.
SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

function AppStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

// Resolves the KeyboardProvider safely. If the native module is missing or
// throws for any reason we fall back to a plain GestureHandlerRootView so the
// rest of the app still renders.
function AppShell() {
  if (Platform.OS === "web") {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppStack />
      </GestureHandlerRootView>
    );
  }

  try {
    // Lazy require keeps the module off the critical startup path.
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

    // Hard timeout: if fonts never resolve (e.g. assets missing in APK) we
    // still show the app after 3 s rather than leaving the user on the splash.
    const timer = setTimeout(() => {
      if (__DEV__) {
        console.warn("[Layout] Font loading timed out — using system fonts");
      }
      finish();
    }, 3000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [fontsLoaded, fontError]);

  // While waiting: render a solid-colour view (never null) so there is no
  // white flash. The splash screen sits on top until hideAsync() is called.
  if (!appReady) {
    return <View style={{ flex: 1, backgroundColor: "#EEF2FF" }} />;
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
