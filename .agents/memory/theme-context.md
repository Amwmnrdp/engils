---
name: ThemeContext pattern
description: How manual theme (light/dark/auto) is managed in the mobile app
---

The app uses `context/ThemeContext.tsx` (wraps root in `_layout.tsx`) to store theme preference in AsyncStorage under `"@theme_preference"`.

`useColors()` reads `isDark` from ThemeContext — NOT from `useColorScheme()` directly.

All screens use `colors.isDark` (returned by `useColors()`) instead of calling `useColorScheme()` themselves.

ThemeProvider must be the **outermost** wrapper (outside SafeAreaProvider and AppProvider) so it's available everywhere.

**Why:** Allows manual user override independent of OS appearance setting. Without this, changing theme in settings had no effect.
