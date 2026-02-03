import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS, RADIUS } from "../../constants/theme";
import { getJSON } from "../../lib/api";

export default function TeacherDashboard() {
  const { width } = useWindowDimensions();
  const isWide = width >= 820;

  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const pending = await getJSON("/teacher/ai/pending?limit=200");
      setPendingCount(Array.isArray(pending) ? pending.length : 0);
    } catch (e: any) {
      setErr(e?.message || "Failed to load teacher dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cards = useMemo(
    () => [
      {
        title: "Generate AI Task",
        desc: "Create a candidate task using the model.",
        onPress: () => router.push("/(teacher)/generate"),
      },
      {
        title: "Review Pending",
        desc: "Approve or reject AI tasks.",
        onPress: () => router.push("/(teacher)/review"),
      },
      {
        title: "Lesson Focus",
        desc: "View available topics from the API.",
        onPress: () => router.push("/(teacher)/lesson-focus"),
      },
      {
        title: "Upload Words",
        desc: "Bulk lexicon upload (endpoint required).",
        onPress: () => router.push("/(teacher)/upload-words"),
      },
    ],
    []
  );

  return (
    <ResponsiveScreen>
      <TopBar title="Teacher Dashboard" rightIcon="✕" onRight={() => router.back()} />

      <GlassCard>
        <Text style={styles.h1}>Overview</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
            <Text style={styles.muted}>Loading…</Text>
          </View>
        ) : err ? (
          <>
            <Text style={styles.err}>{err}</Text>
            <Pressable onPress={load} style={({ pressed }) => [styles.pill, pressed && { opacity: 0.92 }]}>
              <Text style={styles.pillText}>Retry</Text>
            </Pressable>
          </>
        ) : (
          <View style={[styles.statsRow, isWide && styles.statsRowWide]}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Pending AI Tasks</Text>
              <Text style={styles.statValue}>{pendingCount}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>API</Text>
              <Text style={styles.statValue}>OK</Text>
            </View>
          </View>
        )}
      </GlassCard>

      <View style={[styles.grid, isWide && styles.gridWide]}>
        {cards.map((c) => (
          <Pressable key={c.title} onPress={c.onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}>
            <Text style={styles.cardTitle}>{c.title}</Text>
            <Text style={styles.cardDesc}>{c.desc}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={() => router.back()} style={{ marginTop: 14, alignSelf: "center" }}>
        <Text style={{ fontWeight: "900", color: "rgba(28,53,87,0.7)" }}>Back</Text>
      </Pressable>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 18, fontWeight: "900", color: COLORS.ink, textAlign: "center" },

  center: { alignItems: "center", paddingVertical: 12 },
  muted: { marginTop: 10, fontWeight: "800", color: "rgba(28,53,87,0.7)" },
  err: { marginTop: 10, fontWeight: "800", color: "#B42318", textAlign: "center" },

  pill: {
    marginTop: 12,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: COLORS.green,
    borderWidth: 1,
    borderColor: COLORS.greenDark,
  },
  pillText: { color: "white", fontWeight: "900" },

  statsRow: { marginTop: 12, gap: 12 },
  statsRowWide: { flexDirection: "row" },
  statCard: {
    flex: 1,
    borderRadius: RADIUS.xl,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: COLORS.stroke,
  },
  statLabel: { fontWeight: "900", color: "rgba(28,53,87,0.75)", textAlign: "center" },
  statValue: { marginTop: 6, fontWeight: "900", fontSize: 26, color: COLORS.ink, textAlign: "center" },

  grid: { marginTop: 14, gap: 12 },
  gridWide: { flexDirection: "row", flexWrap: "wrap" },

  card: {
    borderRadius: RADIUS.xl,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: COLORS.stroke,
  },
  cardTitle: { fontWeight: "900", fontSize: 16, color: COLORS.ink },
  cardDesc: { marginTop: 6, fontWeight: "700", color: "rgba(28,53,87,0.72)" },
});
