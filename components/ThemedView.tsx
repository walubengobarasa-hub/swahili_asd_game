import React from "react";
import { View, ViewProps } from "react-native";

export default function ThemedView({ style, ...props }: ViewProps) {
  return <View style={[{ backgroundColor: "transparent" }, style]} {...props} />;
}
