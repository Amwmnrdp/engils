import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

export type ThemePreference = "light" | "dark" | "auto";

interface ThemeContextType {
  theme: ThemePreference;
  setTheme: (t: ThemePreference) => Promise<void>;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "auto",
  setTheme: async () => {},
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>("auto");
  const systemScheme = useColorScheme();

  useEffect(() => {
    AsyncStorage.getItem("@theme_preference").then((v) => {
      if (v === "light" || v === "dark" || v === "auto") {
        setThemeState(v);
      }
    });
  }, []);

  const isDark =
    theme === "dark" || (theme === "auto" && systemScheme === "dark");

  const setTheme = async (t: ThemePreference) => {
    setThemeState(t);
    await AsyncStorage.setItem("@theme_preference", t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
