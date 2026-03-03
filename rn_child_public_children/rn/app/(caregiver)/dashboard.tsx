import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS, RADIUS } from "../../constants/theme";
import { getJSON } from "../../lib/api";

export default function CaregiverDashboard() {
  const { width } = useWindowDimensions();
  const isWide = width >= 820;

  const { child_id } = useLocalSearchParams<{ child_id?: string }>();
  const childId = useMemo(() => Number(child_id ?? "1") || 1, [child_id]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const [r, s] = await Promise.all([getJSON(`/reports/child/${childId}`), getJSON(`/caregiver/settings/${childId}`)]);
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
          <Pressable onPress={load} style={({ pressed }) => [styles.retry, pressed && { opacity: 0.92 }]}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </GlassCard>
      ) : (
        <View style={[styles.row, isWide && styles.rowWide]}>
          <View style={[styles.col, isWide && styles.colHalf]}>
            <GlassCard>
              <Text style={styles.h1}>Progress Summary</Text>
              <View style={{ marginTop: 8, gap: 6 }}>
                <Text style={styles.stat}>Child ID: <Text style={styles.bold}>{childId}</Text></Text>
                <Text style={styles.stat}>Total Attempts: <Text style={styles.bold}>{report?.total_attempts ?? 0}</Text></Text>
                <Text style={styles.stat}>Correct: <Text style={styles.bold}>{report?.correct ?? 0}</Text></Text>
                <Text style={styles.stat}>Accuracy: <Text style={styles.bold}>{accuracyPct}%</Text></Text>
              </View>

              <Pressable
                onPress={() => router.push({ pathname: "/(caregiver)/child-progress", params: { childId: String(childId) } })}
                style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.92 }]}
              >
                <Text style={styles.secondaryBtnText}>View Details</Text>
              </Pressable>
            </GlassCard>
          </View>

          <View style={[styles.col, isWide && styles.colHalf]}>
            <GlassCard>
              <Text style={styles.h1}>Session Settings</Text>
              <View style={{ marginTop: 8, gap: 6 }}>
                <Text style={styles.stat}>
                  Session Length: <Text style={styles.bold}>{settings?.session_minutes ?? 10} min</Text>
                </Text>
                <Text style={styles.stat}>
                  Sound: <Text style={styles.bold}>{(settings?.sound_on ?? true) ? "On" : "Off"}</Text>
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  router.push({ pathname: "/(caregiver)/settings", params: { child_id: String(childId) } })
                }
                style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.92 }]}
              >
                <Text style={styles.primaryBtnText}>Edit Settings</Text>
              </Pressable>
            </GlassCard>

            <Pressable onPress={load} style={({ pressed }) => [styles.refreshLink, pressed && { opacity: 0.75 }]}>
              <Text style={styles.refreshText}>Refresh</Text>
            </Pressable>
          </View>
        </View>
      )}

      <Pressable style={{ marginTop: 14, alignSelf: "center" }} onPress={() => router.replace("/(child)/topics")}>
        <Text style={{ fontWeight: "900", color: "rgba(28,53,87,0.7)" }}>Back to Child App</Text>
      </Pressable>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  row: { gap: 14 },
  rowWide: { flexDirection: "row", alignItems: "flex-start" },
  col: {},
  colHalf: { flex: 1 },

  h1: { fontSize: 18, fontWeight: "900", color: COLORS.ink, textAlign: "center" },
  p: { marginTop: 8, fontWeight: "700", color: "rgba(28,53,87,0.75)", textAlign: "center" },

  stat: { fontSize: 14, fontWeight: "800", color: "rgba(28,53,87,0.78)" },
  bold: { fontWeight: "900", color: COLORS.ink },

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
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: RADIUS.xl,
    backgroundColor: "rgba(124,58,237,0.10)",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.35)",
    alignItems: "center",
  },
  secondaryBtnText: { color: "#7C3AED", fontWeight: "900" },

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

  refreshLink: { marginTop: 12, alignSelf: "center" },
  refreshText: { fontWeight: "900", color: "rgba(28,53,87,0.7)" },
});
