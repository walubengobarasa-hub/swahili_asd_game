import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS, RADIUS } from "../../constants/theme";

const MOCK = [
  { when: "Just now", label: "match_word • food" },
  { when: "5 min ago", label: "match_word • songs" },
  { when: "Yesterday", label: "match_word • school" },
];

export default function TeacherRecentTasks() {
  return (
    <ResponsiveScreen>
      <TopBar title="Recent Tasks" rightIcon="✕" onRight={() => router.back()} />

      <GlassCard>
        <Text style={styles.h1}>Recent Tasks</Text>
        <Text style={styles.p}>Placeholder list until the server endpoint is available.</Text>

        <View style={{ marginTop: 12, gap: 10 }}>
          {MOCK.map((t) => (
            <View key={t.when + t.label} style={styles.item}>
              <Text style={styles.when}>{t.when}</Text>
              <Text style={styles.label}>{t.label}</Text>
            </View>
          ))}
        </View>

        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && { opacity: 0.92 }]}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </GlassCard>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 18, fontWeight: "900", color: COLORS.ink, textAlign: "center" },
  p: { marginTop: 8, fontWeight: "700", color: "rgba(28,53,87,0.75)", textAlign: "center" },
  item: {
    padding: 12,
    borderRadius: RADIUS.xl,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: COLORS.stroke,
  },
  when: { fontWeight: "900", color: COLORS.ink },
  label: { marginTop: 4, fontWeight: "700", color: "rgba(28,53,87,0.75)" },
  back: {
    marginTop: 14,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: COLORS.green,
    borderWidth: 1,
    borderColor: COLORS.greenDark,
  },
  backText: { color: "white", fontWeight: "900" },
});
