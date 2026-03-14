import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS, RADIUS } from "../../constants/theme";
import { api, getJSON } from "../../lib/api";

export default function TeacherDashboard() {
  const { width } = useWindowDimensions();
  const isWide = width >= 820;

  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [children, setChildren] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

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
        title: "Recent Tasks",
        desc: "View recent child task activity.",
        onPress: () => router.push("/(teacher)/recent-tasks"),
      },
      {
        title: "View Children Progress",
        desc: "Open child-level analytics for each learner.",
        onPress: () => router.push("/(teacher)/recent-tasks"),
      },
      {
        title: "Lesson Focus",
        desc: "View available topics from the API.",
        onPress: () => router.push("/(teacher)/lesson-focus"),
      },
      {
        title: "Manage Topics",
        desc: "Create and maintain topic categories.",
        onPress: () => router.push("/(teacher)/topics"),
      },
      {
        title: "Upload Words",
        desc: "Bulk lexicon upload via CSV/text.",
        onPress: () => router.push("/(teacher)/upload-words"),
      },
      {
        title: "Settings",
        desc: "Logout and account options.",
        onPress: () => router.push("/(teacher)/settings"),
      },
    ],
    []
  );

  const load = async () => {
    setLoading(true);
    setErr(null);

    try {
      const [pending, reports] = await Promise.all([
        getJSON("/teacher/ai/pending?limit=200"),
        api.getTeacherChildrenReports(),
      ]);

      setPendingCount(Array.isArray(pending?.items) ? pending.items.length : 0);
      setChildren(Array.isArray(reports?.items) ? reports.items : []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load teacher dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <ResponsiveScreen>
      <TopBar title="Teacher Dashboard" rightIcon="✕" onRight={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false}>
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
              <Pressable onPress={load} style={styles.pill}>
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
                <Text style={styles.statLabel}>Children Tracked</Text>
                <Text style={styles.statValue}>{children.length}</Text>
              </View>
            </View>
          )}
        </GlassCard>

        <GlassCard>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Child-Level Analytics</Text>
              <Text style={styles.sectionSub}>
                Teachers can view analytics for every child individually.
              </Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator />
            </View>
          ) : err ? (
            <Text style={styles.err}>{err}</Text>
          ) : children.length === 0 ? (
            <Text style={styles.muted}>No child analytics yet.</Text>
          ) : (
            <View style={{ marginTop: 12, gap: 12 }}>
              {children.map((child) => {
                const strengths = Array.isArray(child?.strengths) ? child.strengths : [];
                const weaknesses = Array.isArray(child?.weaknesses) ? child.weaknesses : [];
                const topStrength = strengths.length ? strengths[0] : null;
                const topWeakness = weaknesses.length ? weaknesses[0] : null;
                const accuracyPct = Math.round((child?.accuracy ?? 0) * 100);

                return (
                  <Pressable
                    key={child.child_id}
                    onPress={() =>
                      router.push({
                        pathname: "/(teacher)/child-progress",
                        params: { childId: String(child.child_id) },
                      })
                    }
                    style={({ pressed }) => [styles.childCard, pressed && { opacity: 0.92 }]}
                  >
                    <View style={styles.childTopRow}>
                      <Text style={styles.childName}>
                        {child.child_name ?? `Child ${child.child_id}`}
                      </Text>
                      <Text style={styles.childLevel}>Level {child.current_level ?? 1}/5</Text>
                    </View>

                    <View style={styles.metricsRow}>
                      <View style={styles.metricMini}>
                        <Text style={styles.metricMiniLabel}>Accuracy</Text>
                        <Text style={styles.metricMiniValue}>{accuracyPct}%</Text>
                      </View>

                      <View style={styles.metricMini}>
                        <Text style={styles.metricMiniLabel}>Attempts</Text>
                        <Text style={styles.metricMiniValue}>{child.total_attempts ?? 0}</Text>
                      </View>

                      <View style={styles.metricMini}>
                        <Text style={styles.metricMiniLabel}>Streak</Text>
                        <Text style={styles.metricMiniValue}>{child.current_streak ?? 0}</Text>
                      </View>
                    </View>

                    <View style={styles.analysisBox}>
                      <Text style={styles.analysisTitle}>Top Strength</Text>
                      <Text style={styles.analysisText}>
                        {topStrength ? `${topStrength.area} • ${Math.round((topStrength.accuracy ?? 0) * 100)}%` : "No strength data yet"}
                      </Text>
                    </View>

                    <View style={styles.analysisBox}>
                      <Text style={styles.analysisTitle}>Needs Support</Text>
                      <Text style={styles.analysisText}>
                        {topWeakness ? `${topWeakness.area} • ${Math.round((topWeakness.accuracy ?? 0) * 100)}%` : "No weakness data yet"}
                      </Text>
                    </View>

                    <Text style={styles.openLink}>Open full child analytics</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </GlassCard>

        <View style={[styles.grid, isWide && styles.gridWide]}>
          {cards.map((c) => (
            <Pressable
              key={c.title}
              onPress={c.onPress}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
            >
              <Text style={styles.cardTitle}>{c.title}</Text>
              <Text style={styles.cardDesc}>{c.desc}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 18, fontWeight: "900", color: COLORS.ink, textAlign: "center" },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: COLORS.ink, marginBottom: 6 },
  sectionSub: { color: "rgba(28,53,87,0.72)", fontWeight: "700", lineHeight: 19 },
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
  childCard: {
    borderRadius: RADIUS.xl,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: COLORS.stroke,
  },
  childTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  childName: { color: COLORS.ink, fontWeight: "900", fontSize: 16, flex: 1, paddingRight: 10 },
  childLevel: { color: "#7C3AED", fontWeight: "900" },
  metricsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  metricMini: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: COLORS.stroke,
    alignItems: "center",
  },
  metricMiniLabel: { color: "rgba(28,53,87,0.68)", fontWeight: "800", fontSize: 12 },
  metricMiniValue: { marginTop: 4, color: COLORS.ink, fontWeight: "900", fontSize: 17 },
  analysisBox: {
    marginTop: 10,
    borderRadius: RADIUS.lg,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: COLORS.stroke,
  },
  analysisTitle: { color: COLORS.ink, fontWeight: "900", fontSize: 13 },
  analysisText: { marginTop: 4, color: "rgba(28,53,87,0.75)", fontWeight: "700" },
  openLink: { marginTop: 10, color: "#7C3AED", fontWeight: "900" },
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