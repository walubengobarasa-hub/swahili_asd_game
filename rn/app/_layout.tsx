import { Stack } from "expo-router";
import { AccessibilityProvider } from "../context/AccessibilityContext";

export default function RootLayout() {
  return (
    <AccessibilityProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AccessibilityProvider>
  );
}
