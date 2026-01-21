import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS } from "../constants/theme";

export default function TopBar({
  title,
  rightIcon = "⚙️",
  onRight,
  subtitle,
}: {
  title: string;
  subtitle?: string;
  rightIcon?: string;
  onRight?: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        <View style={styles.avatarWrap}>
          <Image source={require("../assets/avatar_child.png")} style={styles.avatar} />
        </View>
        <View>
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.sub}>{subtitle}</Text>}
        </View>
      </View>

      <Pressable onPress={onRight} style={styles.rightBtn}>
        <Text style={styles.icon}>{rightIcon}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "rgba(255,255,255,0.65)",
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.stroke,
  },
  avatar: { width: "100%", height: "100%" },
  title: { fontSize: 18, fontWeight: "900", color: COLORS.ink },
  sub: { fontSize: 12, fontWeight: "700", color: "rgba(28,53,87,0.7)", marginTop: 2 },
  rightBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  icon: { fontSize: 20 },
});
