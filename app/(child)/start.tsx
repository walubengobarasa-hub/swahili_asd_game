import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import BigGreenButton from "../../components/BigGreenButton";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import { clamp } from "../../constants/responsive";
import { COLORS } from "../../constants/theme";

export default function Start() {
  const { width } = useWindowDimensions();
  const helloSize = clamp(width * 0.08, 28, 40);
  const bannerSize = clamp(width * 0.045, 16, 20);

  return (
    <ResponsiveScreen>
      <View style={styles.top}>
        <GlassCard>
          <View style={styles.avatarRow}>
            <Image source={require("../../assets/avatar_child.png")} style={styles.avatar} />
            <Text style={[styles.hello, { fontSize: helloSize }]}>Hello!</Text>
          </View>

          <View style={styles.banner}>
            <Text style={[styles.bannerText, { fontSize: bannerSize }]}>Let’s learn Kiswahili!</Text>
            <Text style={styles.stars}>⭐ ⭐ ⭐ ⭐ ☆</Text>
          </View>

          <View style={{ marginTop: 18 }}>
            <BigGreenButton label="START ▶" onPress={() => router.push("/(child)/topics")} />
          </View>
        </GlassCard>
      </View>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  top: { marginTop: 14 },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#fff" },
  hello: { fontWeight: "900", color: COLORS.ink },

  banner: {
    marginTop: 14,
    backgroundColor: COLORS.cream,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.stroke,
  },
  bannerText: { fontWeight: "900", color: COLORS.ink, textAlign: "center" },
  stars: { marginTop: 6, textAlign: "center", fontSize: 16 },
});
