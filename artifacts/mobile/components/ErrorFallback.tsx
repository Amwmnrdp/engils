import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const handleRestart = () => {
    try {
      // Dynamically import reloadAppAsync so a missing export never crashes this screen
      const expo = require("expo") as { reloadAppAsync?: () => Promise<void> };
      if (typeof expo.reloadAppAsync === "function") {
        expo.reloadAppAsync().catch(() => resetError());
      } else {
        resetError();
      }
    } catch {
      resetError();
    }
  };

  return (
    <View style={styles.container}>
      <Feather name="alert-triangle" size={48} color="#FF4B4B" style={styles.icon} />

      <Text style={styles.title}>حدث خطأ غير متوقع</Text>
      <Text style={styles.subtitle}>Something went wrong</Text>

      {__DEV__ && (
        <Text style={styles.errorMsg} selectable>
          {error?.message ?? "Unknown error"}
        </Text>
      )}

      <Pressable
        onPress={handleRestart}
        style={({ pressed }) => [styles.button, { opacity: pressed ? 0.8 : 1 }]}
      >
        <Text style={styles.buttonText}>أعد تشغيل التطبيق / Restart</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  errorMsg: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 24,
    fontFamily: Platform.select({ android: "monospace", default: "monospace" }),
  },
  button: {
    backgroundColor: "#005EFF",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});
