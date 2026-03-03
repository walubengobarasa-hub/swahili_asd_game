import React from "react";
import { Pressable, Text, ViewStyle } from "react-native";
import { COLORS } from "../constants/theme";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

export default function PrimaryButton({ title, onPress, disabled, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 14,
          backgroundColor: disabled ? "rgba(77,175,58,0.35)" : COLORS.green,
          borderWidth: 1,
          borderColor: disabled ? "rgba(44,124,34,0.20)" : COLORS.greenDark,
          opacity: pressed ? 0.9 : 1,
          alignItems: "center",
        },
        style,
      ]}
    >
      <Text style={{ color: "#fff", fontWeight: "700" }}>{title}</Text>
    </Pressable>
  );
}
