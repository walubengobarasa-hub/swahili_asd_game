import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS, RADIUS } from "../../constants/theme";
import { api } from "../../lib/api";

export default function TeacherChildProgress() {
  const { width } = useWindowDimensions();
  const isWide = width >= 820;

  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);

    try {
      const res = await api.getTeacherChildrenReports();
      const items = Array.isArray(res?.items) ? res.items : [];

      setReports(items);

      if (items.length > 0) {
        setSelectedChildId((prev) => {
          if (prev && items.some((x: any) => Number(x?.child_id) === prev)) {
            return prev;
          }
          return Number(items[0]?.child_id);
        });
      } else {
        setSelectedChildId(null);
      }
    } catch (e: any) {
      setErr(e?.message || "Failed to load children analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selectedReport = useMemo(() => {
    if (!selectedChildId) return null;
    return (
      reports.find((r: any) => Number(r?.child_id) === Number(selectedChildId)) ??
      null
    );
  }, [reports, selectedChildId]);

  const accuracyPct = Math.round((Number(selectedReport?.accuracy ?? 0) || 0) * 100);
  const weekly = Array.isArray(selectedReport?.performance_trend)
    ? selectedReport.performance_trend
    : [];
  const modalities = Array.isArray(selectedReport?.modality_breakdown)
    ? selectedReport.modality_breakdown
    : [];
  const strengths = Array.isArray(selectedReport?.strengths)
    ? selectedReport.strengths
    : [];
  const weaknesses = Array.isArray(selectedReport?.weaknesses)
    ? selectedReport.weaknesses
    : [];
  const taskRates = Array.isArray(selectedReport?.task_success_rates)
    ? selectedReport.task_success_rates
    : [];
  const recent = Array.isArray(selectedReport?.recent_activity)
    ? selectedReport.recent_activity
    : [];

  const maxWeekly = Math.max(1, ...weekly.map((x: any) => Number(x?.attempts ?? 0)));

  return (
    <ResponsiveScreen>
      <TopBar title="Child Analytics" rightIcon="✕" onRight={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <GlassCard>
          <Text style={styles.h1}>All Children Analytics</Text>
          <Text style={styles.sub}>
            Select a child to view individual performance.
          </Text>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator />
              <Text style={styles.muted}>Loading…</Text>
            </View>
          ) : err ? (
            <>
              <Text style={styles.err}>{err}</Text>
              <Pressable onPress={load} style={styles.retry}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </>
          ) : (
            <Text style={styles.summary}>Children found: {reports.length}</Text>
          )}
        </GlassCard>

        {/* Children Tabs */}
        {!loading && !err && reports.length > 0 && (
          <GlassCard>
            <Text style={styles.sectionTitle}>Children</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
              {reports.map((child: any) => {
                const isActive = Number(child?.child_id) === Number(selectedChildId);

                return (
                  <Pressable
                    key={String(child?.child_id)}
                    onPress={() => setSelectedChildId(Number(child?.child_id))}
                    style={[
                      styles.tabBtn,
                      isActive && styles.tabBtnActive,
                    ]}
                  >
                    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                      {child?.child_name ?? `Child ${child?.child_id}`}
                    </Text>

                    <Text style={[styles.tabSub, isActive && styles.tabSubActive]}>
                      L{child?.current_level ?? 1} • {Math.round((Number(child?.accuracy ?? 0) || 0) * 100)}%
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </GlassCard>
        )}

        {/* Child Report */}
        {!loading && !err && selectedReport && (
          <>
            <GlassCard>
              <Text style={styles.childName}>
                {selectedReport?.child_name ?? `Child ${selectedReport?.child_id}`}
              </Text>

              <View style={[styles.statsGrid, isWide && styles.statsGridWide]}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Accuracy</Text>
                  <Text style={styles.statValue}>{accuracyPct}%</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Level</Text>
                  <Text style={styles.statValue}>
                    {selectedReport?.current_level ?? 1}/5
                  </Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Attempts</Text>
                  <Text style={styles.statValue}>
                    {selectedReport?.total_attempts ?? 0}
                  </Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Streak</Text>
                  <Text style={styles.statValue}>
                    {selectedReport?.current_streak ?? 0}
                  </Text>
                </View>
              </View>
            </GlassCard>

            {/* Task Success Rates */}
            <GlassCard>
              <Text style={styles.sectionTitle}>Task Success Rates</Text>

              {taskRates.map((m: any) => {
                const pct = Math.round((Number(m?.success_rate ?? 0) || 0) * 100);

                return (
                  <View key={m.task_type} style={styles.modalityItem}>
                    <View style={styles.modalityTop}>
                      <Text style={styles.modalityTitle}>
                        {String(m.task_type).toUpperCase()}
                      </Text>

                      <Text style={styles.modalityMeta}>
                        {pct}% • {m.correct}/{m.attempts}
                      </Text>
                    </View>

                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${pct}%` }]} />
                    </View>
                  </View>
                );
              })}
            </GlassCard>

            {/* Recent Activity */}
            <GlassCard>
              <Text style={styles.sectionTitle}>Recent Activity</Text>

              {recent.map((item: any) => (
                <View key={item.attempt_id} style={styles.activityItem}>
                  <Text style={styles.activityTitle}>
                    {item.task_type} • {item.is_correct ? "correct" : "wrong"}
                  </Text>

                  <Text style={styles.activityMeta}>
                    {item.lesson_focus} • {item.response_time_ms} ms
                  </Text>
                </View>
              ))}
            </GlassCard>
          </>
        )}
      </ScrollView>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 18, fontWeight: "900", color: COLORS.ink, textAlign: "center" },

  sub: {
    marginTop: 6,
    color: "rgba(28,53,87,0.72)",
    fontWeight: "700",
    textAlign: "center",
  },

  summary: {
    marginTop: 10,
    color: COLORS.ink,
    fontWeight: "800",
    textAlign: "center",
  },

  childName: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.ink,
    textAlign: "center",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.ink,
    marginBottom: 12,
  },

  center: { alignItems: "center", paddingVertical: 12 },

  muted: {
    marginTop: 10,
    fontWeight: "800",
    color: "rgba(28,53,87,0.7)",
    textAlign: "center",
  },

  err: {
    marginTop: 10,
    fontWeight: "800",
    color: "#B42318",
    textAlign: "center",
  },

  retry: {
    marginTop: 12,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: COLORS.green,
  },

  retryText: { color: "white", fontWeight: "900" },

  tabsRow: { gap: 10, paddingRight: 8 },

  tabBtn: {
    minWidth: 150,
    padding: 12,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    backgroundColor: "rgba(255,255,255,0.75)",
  },

  tabBtnActive: {
    backgroundColor: "rgba(124,58,237,0.12)",
    borderColor: "rgba(124,58,237,0.45)",
  },

  tabText: { color: COLORS.ink, fontWeight: "900" },

  tabTextActive: { color: "#7C3AED" },

  tabSub: {
    marginTop: 4,
    color: "rgba(28,53,87,0.72)",
    fontWeight: "700",
    fontSize: 12,
  },

  tabSubActive: { color: "#7C3AED" },

  statsGrid: { marginTop: 12, gap: 12 },

  statsGridWide: { flexDirection: "row" },

  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    backgroundColor: "rgba(255,255,255,0.75)",
  },

  statLabel: { fontWeight: "900", textAlign: "center" },

  statValue: {
    marginTop: 6,
    fontWeight: "900",
    fontSize: 24,
    color: COLORS.ink,
    textAlign: "center",
  },

  modalityItem: { marginBottom: 14 },

  modalityTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  modalityTitle: {
    color: COLORS.ink,
    fontWeight: "900",
  },

  modalityMeta: {
    color: "rgba(28,53,87,0.72)",
    fontWeight: "800",
  },

  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(28,53,87,0.08)",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#7C3AED",
  },

  activityItem: {
    marginBottom: 12,
    padding: 12,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    backgroundColor: "rgba(255,255,255,0.75)",
  },

  activityTitle: {
    color: COLORS.ink,
    fontWeight: "900",
  },

  activityMeta: {
    color: "rgba(28,53,87,0.72)",
    fontWeight: "700",
    fontSize: 12,
  },
});