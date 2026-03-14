import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS, RADIUS } from "../../constants/theme";
import { api } from "../../lib/api";

export default function CaregiverDashboard() {
  const { width } = useWindowDimensions();
  const isWide = width >= 820;

  const { child_id } = useLocalSearchParams<{ child_id?: string }>();
  const childId = useMemo(() => Number(child_id ?? "0") || 0, [child_id]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  const load = async () => {
    if (!childId) {
      setErr("Missing child id.");
      return;
    }

    setLoading(true);
    setErr(null);
    try {
      const [r, s] = await Promise.all([
        api.getChildReport(childId),
        api.caregiverSettings.get(childId),
      ]);
      setReport(r);
      setSettings(s);
    } catch (e: any) {
      setErr(e?.message || "Failed to load caregiver dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [childId]);

  const accuracyPct = Math.round(((report?.accuracy ?? 0) as number) * 100);

  return (
    <ResponsiveScreen>
      <TopBar title="Caregiver" rightIcon="✕" onRight={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <GlassCard>
            <View style={{ alignItems: "center", paddingVertical: 12 }}>
              <ActivityIndicator />
              <Text style={{ marginTop: 10, fontWeight: "800", color: "rgba(28,53,87,0.7)" }}>Loading…</Text>
            </View>
          </GlassCard>
        ) : err ? (
          <GlassCard>
            <Text style={styles.h1}>Couldn’t load</Text>
            <Text style={styles.p}>{err}</Text>
            <Pressable onPress={load} style={styles.retry}><Text style={styles.retryText}>Retry</Text></Pressable>
          </GlassCard>
        ) : (
          <>
            <GlassCard>
              <Text style={styles.h1}>{report?.child_name ?? `Child ${childId}`}</Text>
              <Text style={styles.p}>Individual dashboard for this child only.</Text>

              <View style={[styles.statsGrid, isWide && styles.statsGridWide]}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Level</Text>
                  <Text style={styles.statValue}>{report?.current_level ?? 1}/5</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Accuracy</Text>
                  <Text style={styles.statValue}>{accuracyPct}%</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Attempts</Text>
                  <Text style={styles.statValue}>{report?.total_attempts ?? 0}</Text>
                </View>
              </View>
            </GlassCard>

            <View style={[styles.statsGrid, isWide && styles.statsGridWide]}>
              <GlassCard style={undefined as any}>
                <Text style={styles.sectionTitle}>Strengths</Text>
                {(report?.strengths ?? []).length ? (
                  (report?.strengths ?? []).map((item: any) => (
                    <Text key={item.area} style={styles.lineItem}>
                      {item.area}: {Math.round((item.accuracy ?? 0) * 100)}%
                    </Text>
                  ))
                ) : (
                  <Text style={styles.empty}>No strength data yet.</Text>
                )}
              </GlassCard>

              <GlassCard style={undefined as any}>
                <Text style={styles.sectionTitle}>Needs Support</Text>
                {(report?.weaknesses ?? []).length ? (
                  (report?.weaknesses ?? []).map((item: any) => (
                    <Text key={item.area} style={styles.lineItem}>
                      {item.area}: {Math.round((item.accuracy ?? 0) * 100)}%
                    </Text>
                  ))
                ) : (
                  <Text style={styles.empty}>No weakness data yet.</Text>
                )}
              </GlassCard>
            </View>

            <GlassCard>
              <Text style={styles.sectionTitle}>Session Settings</Text>
              <Text style={styles.lineItem}>Session Length: {settings?.session_minutes ?? 10} min</Text>
              <Text style={styles.lineItem}>Sound: {(settings?.sound_on ?? true) ? "On" : "Off"}</Text>

              <Pressable
                onPress={() => router.push({ pathname: "/(caregiver)/settings", params: { child_id: String(childId) } })}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryBtnText}>Edit Settings</Text>
              </Pressable>
            </GlassCard>

            <Pressable
              onPress={() => router.push({ pathname: "/(caregiver)/child-progress", params: { childId: String(childId) } })}
              style={styles.secondaryBtn}
            >
              <Text style={styles.secondaryBtnText}>Open Full Analytics</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 18, fontWeight: "900", color: COLORS.ink, textAlign: "center" },
  p: { marginTop: 8, fontWeight: "700", color: "rgba(28,53,87,0.75)", textAlign: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: COLORS.ink, marginBottom: 10 },
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
  lineItem: { fontWeight: "800", color: "rgba(28,53,87,0.8)", marginBottom: 8 },
  empty: { color: "rgba(28,53,87,0.7)", fontWeight: "700" },
  retry: {
    marginTop: 12,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: COLORS.green,
  },
  retryText: { color: "white", fontWeight: "900" },
  primaryBtn: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.green,
    borderWidth: 1,
    borderColor: COLORS.greenDark,
    alignItems: "center",
  },
  primaryBtnText: { color: "white", fontWeight: "900" },
  secondaryBtn: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: RADIUS.xl,
    backgroundColor: "rgba(124,58,237,0.10)",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.35)",
    alignItems: "center",
  },
  secondaryBtnText: { color: "#7C3AED", fontWeight: "900" },
});