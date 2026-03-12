import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS, RADIUS } from "../../constants/theme";
import { api } from "../../lib/api";

export default function ChildProgress() {
  const { width } = useWindowDimensions();
  const isWide = width >= 820;

  const params = useLocalSearchParams<{ childId?: string }>();
  const childId = useMemo(() => Number(params.childId ?? "1") || 1, [params.childId]);

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await api.getChildReport(childId);
      setReport(r);
    } catch (e: any) {
      setErr(e?.message || "Failed to load progress.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [childId]);

  const accuracyPct = useMemo(() => Math.round(((report?.accuracy ?? 0) as number) * 100), [report]);
  const weekly = report?.points_last_7_days ?? [];
  const modalities = report?.modality_breakdown ?? [];
  const maxWeekly = Math.max(1, ...weekly.map((d: any) => Number(d?.points ?? 0)));

  return (
    <ResponsiveScreen>
      <TopBar title={`Child ${childId} Progress`} rightIcon="✕" onRight={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <GlassCard>
          <Text style={styles.h1}>Progress Snapshot</Text>

          {loading ? (
            <View style={{ alignItems: "center", paddingVertical: 12 }}>
              <ActivityIndicator />
              <Text style={styles.muted}>Loading…</Text>
            </View>
          ) : err ? (
            <>
              <Text style={styles.err}>{err}</Text>
              <Pressable onPress={load} style={({ pressed }) => [styles.retry, pressed && { opacity: 0.92 }]}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={[styles.statsGrid, isWide && styles.statsGridWide]}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Total Attempts</Text>
                  <Text style={styles.statValue}>{report?.total_attempts ?? 0}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Correct</Text>
                  <Text style={styles.statValue}>{report?.correct ?? 0}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Accuracy</Text>
                  <Text style={styles.statValue}>{accuracyPct}%</Text>
                </View>
              </View>

              <View style={[styles.statsGrid, isWide && styles.statsGridWide, { marginTop: 12 }]}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Avg Response</Text>
                  <Text style={styles.statValueSmall}>{report?.avg_response_time_ms ?? 0} ms</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Current Streak</Text>
                  <Text style={styles.statValueSmall}>{report?.current_streak ?? 0}</Text>
                </View>
              </View>
            </>
          )}
        </GlassCard>

        {!loading && !err && (
          <>
            <GlassCard styleOverride={{ marginTop: 14 }}>
              <Text style={styles.sectionTitle}>Weekly Points</Text>
              <View style={styles.chartRow}>
                {weekly.map((item: any, idx: number) => {
                  const points = Number(item?.points ?? 0);
                  const h = Math.max(10, Math.round((points / maxWeekly) * 120));
                  return (
                    <View key={`${item?.date ?? idx}`} style={styles.barCol}>
                      <Text style={styles.barValue}>{points}</Text>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { height: h }]} />
                      </View>
                      <Text style={styles.barLabel}>{item?.label ?? "-"}</Text>
                    </View>
                  );
                })}
              </View>
            </GlassCard>

            <GlassCard styleOverride={{ marginTop: 14 }}>
              <Text style={styles.sectionTitle}>Learning Breakdown</Text>

              {modalities.length ? (
                modalities.map((m: any, idx: number) => {
                  const pct = Math.round((Number(m?.accuracy ?? 0) || 0) * 100);
                  return (
                    <View key={`${m?.modality ?? "mixed"}-${idx}`} style={styles.modalityItem}>
                      <View style={styles.modalityTop}>
                        <Text style={styles.modalityTitle}>{String(m?.modality ?? "mixed").toUpperCase()}</Text>
                        <Text style={styles.modalityMeta}>
                          {pct}% • {m?.correct ?? 0}/{m?.attempts ?? 0}
                        </Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${pct}%` }]} />
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.muted}>No modality data yet.</Text>
              )}
            </GlassCard>
          </>
        )}

        <Pressable onPress={load} style={({ pressed }) => [styles.refreshBtn, pressed && { opacity: 0.92 }]}>
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </ScrollView>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 18, fontWeight: "900", color: COLORS.ink, textAlign: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: COLORS.ink, marginBottom: 12 },

  muted: { marginTop: 10, fontWeight: "800", color: "rgba(28,53,87,0.7)", textAlign: "center" },
  err: { marginTop: 10, fontWeight: "800", color: "#B42318", textAlign: "center" },

  retry: {
    marginTop: 12,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: COLORS.green,
    borderWidth: 1,
    borderColor: COLORS.greenDark,
  },
  retryText: { color: "white", fontWeight: "900" },

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
  statLabel: { fontWeight: "900", color: "rgba(28,53,87,0.75)", textAlign: "center" },
  statValue: { marginTop: 6, fontWeight: "900", fontSize: 24, color: COLORS.ink, textAlign: "center" },
  statValueSmall: { marginTop: 6, fontWeight: "900", fontSize: 20, color: COLORS.ink, textAlign: "center" },

  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
    paddingTop: 8,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
  },
  barValue: {
    marginBottom: 6,
    color: COLORS.ink,
    fontWeight: "900",
    fontSize: 12,
  },
  barTrack: {
    width: "100%",
    maxWidth: 34,
    height: 120,
    justifyContent: "flex-end",
    borderRadius: 999,
    backgroundColor: "rgba(28,53,87,0.08)",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: 999,
    backgroundColor: "#7C3AED",
  },
  barLabel: {
    marginTop: 8,
    fontWeight: "800",
    color: "rgba(28,53,87,0.8)",
    fontSize: 12,
  },

  modalityItem: {
    marginBottom: 14,
  },
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
    height: 14,
    borderRadius: 999,
    backgroundColor: "rgba(28,53,87,0.08)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#7C3AED",
  },

  refreshBtn: {
    marginTop: 14,
    marginBottom: 24,
    paddingVertical: 14,
    borderRadius: RADIUS.xl,
    backgroundColor: "rgba(124,58,237,0.10)",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.35)",
    alignItems: "center",
  },
  refreshText: { color: "#7C3AED", fontWeight: "900" },
});