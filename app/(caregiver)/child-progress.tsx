import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS, RADIUS } from "../../constants/theme";
import { getJSON } from "../../lib/api";

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
      const r = await getJSON(`/reports/child/${childId}`);
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

  return (
    <ResponsiveScreen>
      <TopBar title={`Child ${childId}`} rightIcon="✕" onRight={() => router.back()} />

      <GlassCard>
        <Text style={styles.h1}>Progress Snapshot</Text>

        {loading ? (
          <View style={{ alignItems: "center", paddingVertical: 12 }}>
            <ActivityIndicator />
            <Text style={{ marginTop: 10, fontWeight: "800", color: "rgba(28,53,87,0.7)" }}>Loading…</Text>
          </View>
        ) : err ? (
          <>
            <Text style={styles.err}>{err}</Text>
            <Pressable onPress={load} style={({ pressed }) => [styles.retry, pressed && { opacity: 0.92 }]}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </>
        ) : (
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
        )}
      </GlassCard>

      <Pressable onPress={load} style={({ pressed }) => [styles.refreshBtn, pressed && { opacity: 0.92 }]}>
        <Text style={styles.refreshText}>Refresh</Text>
      </Pressable>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 18, fontWeight: "900", color: COLORS.ink, textAlign: "center" },

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

  refreshBtn: {
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: RADIUS.xl,
    backgroundColor: "rgba(124,58,237,0.10)",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.35)",
    alignItems: "center",
  },
  refreshText: { color: "#7C3AED", fontWeight: "900" },
});
