import React from "react";
import { View, ViewProps } from "react-native";

export default function GlassCard({ style, ...props }: ViewProps) {
  return (
    <View
      style={[
        {
          backgroundColor: "rgba(255,255,255,0.06)",
          borderColor: "rgba(255,255,255,0.10)",
          borderWidth: 1,
          borderRadius: 18,
          padding: 16,
        },
        style,
      ]}
      {...props}
    />
  );
}
