import React from "react";
import { Platform, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { COLORS, SIZES } from "../constants/theme";
import { useAccessibility } from "../context/AccessibilityContext";

export default function ResponsiveScreen({
  children,
  contentStyle,
}: {
  children: React.ReactNode;
  contentStyle?: any;
}) {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const { lowStimulation } = useAccessibility();

  // Keep content readable on large screens, full width on mobile
  const maxWidth = Math.min(SIZES.maxWidth, Math.max(320, width - 32));

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: lowStimulation ? "#F7F7F7" : COLORS.sky,
      }}
      contentContainerStyle={[
        styles.scroll,
        isWeb ? { alignItems: "center" } : null,
        contentStyle,
      ]}
    >
      <View style={[styles.inner, isWeb ? { width: maxWidth } : { width: "100%" }]}>
        {children}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 38,
    paddingBottom: 26,
  },
  inner: {
    flex: 1,
    maxWidth: SIZES.maxWidth,
    width: "100%",
  },
});
