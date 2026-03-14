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
  const childId = useMemo(() => Number(params.childId ?? "0") || 0, [params.childId]);

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
  const weekly = report?.performance_trend ?? [];
  const modalities = report?.modality_breakdown ?? [];
  const strengths = report?.strengths ?? [];
  const weaknesses = report?.weaknesses ?? [];
  const taskRates = report?.task_success_rates ?? [];
  const maxWeekly = Math.max(1, ...weekly.map((x: any) => Number(x?.attempts ?? 0)));

  return (
    <ResponsiveScreen>
      <TopBar title="Child Progress" rightIcon="✕" onRight={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <GlassCard>
          <Text style={styles.h1}>{report?.child_name ?? `Child ${childId}`}</Text>

          {loading ? (
            <View style={styles.center}><ActivityIndicator /><Text style={styles.muted}>Loading…</Text></View>
          ) : err ? (
            <>
              <Text style={styles.err}>{err}</Text>
              <Pressable onPress={load} style={styles.retry}><Text style={styles.retryText}>Retry</Text></Pressable>
            </>
          ) : (
            <View style={[styles.statsGrid, isWide && styles.statsGridWide]}>
              <View style={styles.statCard}><Text style={styles.statLabel}>Accuracy</Text><Text style={styles.statValue}>{accuracyPct}%</Text></View>
              <View style={styles.statCard}><Text style={styles.statLabel}>Current Level</Text><Text style={styles.statValue}>{report?.current_level ?? 1}/5</Text></View>
              <View style={styles.statCard}><Text style={styles.statLabel}>Streak</Text><Text style={styles.statValue}>{report?.current_streak ?? 0}</Text></View>
              <View style={styles.statCard}><Text style={styles.statLabel}>Avg Response</Text><Text style={styles.statValueSmall}>{report?.avg_response_time_ms ?? 0} ms</Text></View>
            </View>
          )}
        </GlassCard>

        {!!report && (
          <>
            <GlassCard>
              <Text style={styles.sectionTitle}>Performance Trend</Text>
              <View style={styles.chartRow}>
                {weekly.map((day: any) => {
                  const h = Math.max(10, Math.round(((Number(day?.attempts ?? 0) || 0) / maxWeekly) * 120));
                  return (
                    <View key={String(day?.date)} style={styles.barCol}>
                      <Text style={styles.barValue}>{Math.round((Number(day?.accuracy ?? 0) || 0) * 100)}%</Text>
                      <View style={styles.barTrack}><View style={[styles.barFill, { height: h }]} /></View>
                      <Text style={styles.barLabel}>{day?.label ?? "-"}</Text>
                    </View>
                  );
                })}
              </View>
            </GlassCard>

            <View style={[styles.statsGrid, isWide && styles.statsGridWide]}>
              <GlassCard style={undefined as any}>
                <Text style={styles.sectionTitle}>Strength Areas</Text>
                {strengths.length ? strengths.map((item: any) => (
                  <Text key={item.area} style={styles.lineItem}>{item.area}: {Math.round((item.accuracy ?? 0) * 100)}%</Text>
                )) : <Text style={styles.muted}>No strength data yet.</Text>}
              </GlassCard>

              <GlassCard style={undefined as any}>
                <Text style={styles.sectionTitle}>Weakness Areas</Text>
                {weaknesses.length ? weaknesses.map((item: any) => (
                  <Text key={item.area} style={styles.lineItem}>{item.area}: {Math.round((item.accuracy ?? 0) * 100)}%</Text>
                )) : <Text style={styles.muted}>No weakness data yet.</Text>}
              </GlassCard>
            </View>

            <GlassCard>
              <Text style={styles.sectionTitle}>Task Success Rates</Text>
              {taskRates.length ? taskRates.map((m: any) => {
                const pct = Math.round((Number(m?.success_rate ?? 0) || 0) * 100);
                return (
                  <View key={String(m?.task_type)} style={styles.modalityItem}>
                    <View style={styles.modalityTop}>
                      <Text style={styles.modalityTitle}>{String(m?.task_type ?? "task").toUpperCase()}</Text>
                      <Text style={styles.modalityMeta}>{pct}% • {m?.correct ?? 0}/{m?.attempts ?? 0}</Text>
                    </View>
                    <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${pct}%` }]} /></View>
                  </View>
                );
              }) : <Text style={styles.muted}>No task-rate data yet.</Text>}
            </GlassCard>

            <GlassCard>
              <Text style={styles.sectionTitle}>Modality Breakdown</Text>
              {modalities.length ? modalities.map((m: any) => {
                const pct = Math.round((Number(m?.accuracy ?? 0) || 0) * 100);
                return (
                  <View key={String(m?.modality)} style={styles.modalityItem}>
                    <View style={styles.modalityTop}>
                      <Text style={styles.modalityTitle}>{String(m?.modality ?? "mixed").toUpperCase()}</Text>
                      <Text style={styles.modalityMeta}>{pct}% • {m?.correct ?? 0}/{m?.attempts ?? 0}</Text>
                    </View>
                    <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${pct}%` }]} /></View>
                  </View>
                );
              }) : <Text style={styles.muted}>No modality data yet.</Text>}
            </GlassCard>
          </>
        )}
      </ScrollView>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 18, fontWeight: "900", color: COLORS.ink, textAlign: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: COLORS.ink, marginBottom: 12 },
  center: { alignItems: "center", paddingVertical: 12 },
  muted: { marginTop: 10, fontWeight: "800", color: "rgba(28,53,87,0.7)", textAlign: "center" },
  err: { marginTop: 10, fontWeight: "800", color: "#B42318", textAlign: "center" },
  retry: { marginTop: 12, alignSelf: "center", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 999, backgroundColor: COLORS.green },
  retryText: { color: "white", fontWeight: "900" },
  statsGrid: { marginTop: 12, gap: 12 },
  statsGridWide: { flexDirection: "row" },
  statCard: { flex: 1, padding: 14, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.stroke, backgroundColor: "rgba(255,255,255,0.75)" },
  statLabel: { fontWeight: "900", color: "rgba(28,53,87,0.75)", textAlign: "center" },
  statValue: { marginTop: 6, fontWeight: "900", fontSize: 24, color: COLORS.ink, textAlign: "center" },
  statValueSmall: { marginTop: 6, fontWeight: "900", fontSize: 20, color: COLORS.ink, textAlign: "center" },
  lineItem: { fontWeight: "800", color: "rgba(28,53,87,0.8)", marginBottom: 8 },
  chartRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 8, paddingTop: 8 },
  barCol: { flex: 1, alignItems: "center" },
  barValue: { marginBottom: 6, color: COLORS.ink, fontWeight: "900", fontSize: 12 },
  barTrack: { width: "100%", maxWidth: 34, height: 120, justifyContent: "flex-end", borderRadius: 999, backgroundColor: "rgba(28,53,87,0.08)", overflow: "hidden" },
  barFill: { width: "100%", borderRadius: 999, backgroundColor: "#7C3AED" },
  barLabel: { marginTop: 8, fontWeight: "800", color: "rgba(28,53,87,0.8)", fontSize: 12 },
  modalityItem: { marginBottom: 14 },
  modalityTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  modalityTitle: { color: COLORS.ink, fontWeight: "900" },
  modalityMeta: { color: "rgba(28,53,87,0.72)", fontWeight: "800" },
  progressTrack: { height: 14, borderRadius: 999, backgroundColor: "rgba(28,53,87,0.08)", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999, backgroundColor: "#7C3AED" },
});