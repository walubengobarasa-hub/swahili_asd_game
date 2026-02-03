import React from "react";
import { Text, TextProps } from "react-native";

type Props = TextProps & { type?: "default" | "title" | "subtitle" | "link" };

export default function ThemedText({ style, type = "default", ...props }: Props) {
  const base: any = { color: "#e5e7eb" };
  const variant: any =
    type === "title"
      ? { fontSize: 22, fontWeight: "700" }
      : type === "subtitle"
      ? { fontSize: 16, fontWeight: "600" }
      : type === "link"
      ? { textDecorationLine: "underline" }
      : { fontSize: 14 };

  return <Text style={[base, variant, style]} {...props} />;
}
