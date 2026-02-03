import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS, RADIUS } from "../../constants/theme";

export default function TeacherHome() {
  const { width } = useWindowDimensions();
  const isWide = width >= 820;

  return (
    <ResponsiveScreen>
      <TopBar title="Teacher" rightIcon="✕" onRight={() => router.back()} />

      <GlassCard>
        <Text style={styles.h1}>Teacher Tools</Text>
        <Text style={styles.p}>
          Generate AI tasks, review pending items, and manage lesson focus. Built mobile-first for quick moderation.
        </Text>
      </GlassCard>

      <View style={[styles.grid, isWide && styles.gridWide]}>
        <Pressable onPress={() => router.push("/(teacher)/generate")} style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}>
          <Text style={styles.title}>Generate AI Task</Text>
          <Text style={styles.desc}>Create a candidate task using the model.</Text>
        </Pressable>

        <Pressable onPress={() => router.push("/(teacher)/review")} style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}>
          <Text style={styles.title}>Review Pending</Text>
          <Text style={styles.desc}>Approve or reject AI tasks.</Text>
        </Pressable>

        <Pressable onPress={() => router.push("/(teacher)/lesson-focus")} style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}>
          <Text style={styles.title}>Lesson Focus</Text>
          <Text style={styles.desc}>Pick topic focus (MVP screen).</Text>
        </Pressable>

        <Pressable onPress={() => router.push("/(teacher)/upload-words")} style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}>
          <Text style={styles.title}>Upload Words</Text>
          <Text style={styles.desc}>Bulk lexicon (placeholder for endpoint).</Text>
        </Pressable>
      </View>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 20, fontWeight: "900", color: COLORS.ink, textAlign: "center" },
  p: { marginTop: 8, fontWeight: "700", color: "rgba(28,53,87,0.75)", textAlign: "center", lineHeight: 20 },

  grid: { marginTop: 14, gap: 12 },
  gridWide: { flexDirection: "row", flexWrap: "wrap" },

  card: { borderRadius: RADIUS.xl, padding: 14, backgroundColor: "rgba(255,255,255,0.75)", borderWidth: 1, borderColor: COLORS.stroke },
  title: { fontWeight: "900", fontSize: 16, color: COLORS.ink },
  desc: { marginTop: 6, fontWeight: "700", color: "rgba(28,53,87,0.72)" },
});
