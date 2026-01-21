import React from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";

export default function ResponsiveGrid({
  children,
  gap = 12,
}: {
  children: React.ReactNode;
  gap?: number;
}) {
  const { width } = useWindowDimensions();

  // Adaptive columns:
  // very small phones -> 1
  // normal phones -> 2
  // tablets -> 3
  // desktop web -> 4
  const cols =
    width < 360 ? 1 :
    width < 720 ? 2 :
    width < 1024 ? 3 : 4;

  const itemWidth = `${100 / cols}%`;

  return (
    <View style={[styles.grid, { marginHorizontal: -gap / 2 }]}>
      {React.Children.map(children, (child) => (
        <View style={{ width: itemWidth, padding: gap / 2 }}>
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
