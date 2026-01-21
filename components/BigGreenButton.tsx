import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { COLORS, RADIUS } from "../constants/theme";

export default function BigGreenButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.btn} onPress={onPress}>
      <Text style={styles.txt}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: COLORS.green,
    borderRadius: RADIUS.xl,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.greenDark,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  txt: { color: "#fff", fontSize: 22, fontWeight: "900", letterSpacing: 1 },
});
