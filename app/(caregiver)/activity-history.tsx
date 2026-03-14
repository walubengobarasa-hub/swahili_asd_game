import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS, RADIUS } from "../../constants/theme";
import { api } from "../../lib/api";

export default function ActivityHistory() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await api.getCaregiverActivity(40);
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load activity.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <ResponsiveScreen>
      <TopBar title="Activity History" rightIcon="✕" onRight={() => router.back()} />
      <GlassCard>
        <Text style={styles.h1}>Recent Activity</Text>
        <Text style={styles.p}>Only activity from your linked children is shown here.</Text>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 16 }} />
        ) : err ? (
          <Text style={styles.err}>{err}</Text>
        ) : items.length === 0 ? (
          <Text style={styles.empty}>No activity yet.</Text>
        ) : (
          <View style={{ marginTop: 12, gap: 10 }}>
            {items.map((r, i) => (
              <View key={r.attempt_id ?? i} style={styles.row}>
                <Text style={styles.fakeTitle}>
                  {r.child_name} • {r.task_type} • {r.is_correct ? "correct" : "wrong"}
                </Text>
                <Text style={styles.fakeMeta}>
                  {r.lesson_focus} • {r.response_time_ms} ms
                </Text>
              </View>
            ))}
          </View>
        )}
      </GlassCard>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 18, fontWeight: "900", color: COLORS.ink, textAlign: "center" },
  p: { marginTop: 10, fontWeight: "700", color: "rgba(28,53,87,0.75)", textAlign: "center", lineHeight: 20 },
  err: { marginTop: 14, color: "#B42318", fontWeight: "800", textAlign: "center" },
  empty: { marginTop: 14, color: "rgba(28,53,87,0.75)", fontWeight: "700", textAlign: "center" },
  row: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.stroke, backgroundColor: "rgba(255,255,255,0.65)" },
  fakeTitle: { fontWeight: "900", color: COLORS.ink },
  fakeMeta: { marginTop: 4, fontWeight: "700", color: "rgba(28,53,87,0.72)" },
});