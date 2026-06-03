import { Platform, ScrollView, ScrollViewProps } from "react-native";

// Lazy-require so a missing or unlinked native module never crashes the bundle
// at module-evaluation time (before ErrorBoundary can catch anything).
type KASVProps = ScrollViewProps & { keyboardShouldPersistTaps?: "always" | "never" | "handled" };

export function KeyboardAwareScrollViewCompat({
  children,
  keyboardShouldPersistTaps = "handled",
  ...props
}: KASVProps) {
  if (Platform.OS === "web") {
    return (
      <ScrollView keyboardShouldPersistTaps={keyboardShouldPersistTaps} {...props}>
        {children}
      </ScrollView>
    );
  }

  try {
    const { KeyboardAwareScrollView } =
      require("react-native-keyboard-controller") as typeof import("react-native-keyboard-controller");
    return (
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        {...props}
      >
        {children}
      </KeyboardAwareScrollView>
    );
  } catch {
    return (
      <ScrollView keyboardShouldPersistTaps={keyboardShouldPersistTaps} {...props}>
        {children}
      </ScrollView>
    );
  }
}
