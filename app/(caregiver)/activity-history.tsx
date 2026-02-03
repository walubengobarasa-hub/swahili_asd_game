import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS, RADIUS } from "../../constants/theme";

export default function ActivityHistory() {
  return (
    <ResponsiveScreen>
      <TopBar title="Activity History" rightIcon="✕" onRight={() => router.back()} />

      <GlassCard>
        <Text style={styles.h1}>Coming Soon</Text>
        <Text style={styles.p}>
          This screen will show recent tasks, answers, and timestamps once we add an endpoint like{" "}
          <Text style={styles.mono}>GET /caregiver/activity</Text>.
        </Text>

        <View style={{ marginTop: 12, gap: 10 }}>
          <View style={styles.fakeRow}>
            <View style={styles.dot} />
            <Text style={styles.fakeText}>Match image • “mbwa” • correct</Text>
          </View>
          <View style={styles.fakeRow}>
            <View style={styles.dot} />
            <Text style={styles.fakeText}>Fill blank • “Mimi ___ ndizi”</Text>
          </View>
          <View style={styles.fakeRow}>
            <View style={styles.dot} />
            <Text style={styles.fakeText}>Sentence builder • 3 tiles</Text>
          </View>
        </View>

        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.92 }]}>
          <Text style={styles.btnText}>Back</Text>
        </Pressable>
      </GlassCard>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 18, fontWeight: "900", color: COLORS.ink, textAlign: "center" },
  p: { marginTop: 10, fontWeight: "700", color: "rgba(28,53,87,0.75)", textAlign: "center", lineHeight: 20 },
  mono: { fontWeight: "900", color: "#7C3AED" },

  fakeRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.stroke, backgroundColor: "rgba(255,255,255,0.65)" },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.green },
  fakeText: { fontWeight: "800", color: "rgba(28,53,87,0.78)" },

  btn: { marginTop: 14, paddingVertical: 14, borderRadius: RADIUS.xl, backgroundColor: COLORS.green, borderWidth: 1, borderColor: COLORS.greenDark, alignItems: "center" },
  btnText: { color: "white", fontWeight: "900" },
});
