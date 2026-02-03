import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS, RADIUS } from "../../constants/theme";
import { getJSON, postJSON } from "../../lib/api";

export default function ReviewPending() {
  const { width } = useWindowDimensions();
  const isWide = width >= 820;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await getJSON("/teacher/ai/pending?limit=30");
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load pending tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (task_id: number, approved: boolean) => {
    await postJSON("/teacher/ai/approve", { task_id, approved });
    await load();
  };

  return (
    <ResponsiveScreen>
      <TopBar title="Pending AI Tasks" rightIcon="✕" onRight={() => router.back()} />

      <GlassCard>
        <Text style={styles.h1}>Pending Items</Text>
        <Text style={styles.p}>Approve good tasks so they can appear in play sessions.</Text>

        <Pressable onPress={load} style={({ pressed }) => [styles.refresh, pressed && { opacity: 0.92 }]}>
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </GlassCard>

      {loading ? (
        <GlassCard>
          <View style={{ alignItems: "center", paddingVertical: 12 }}>
            <ActivityIndicator />
            <Text style={{ marginTop: 10, fontWeight: "800", color: "rgba(28,53,87,0.7)" }}>Loading…</Text>
          </View>
        </GlassCard>
      ) : err ? (
        <GlassCard>
          <Text style={styles.err}>{err}</Text>
        </GlassCard>
      ) : (
        <View style={[styles.grid, isWide && styles.gridWide]}>
          {items.map((t) => (
            <View key={String(t.task_id)} style={[styles.cardWrap, isWide && styles.cardWrapWide]}>
              <GlassCard>
                <Text style={styles.cardTitle}>
                  {String(t.task_type)} <Text style={{ color: "rgba(28,53,87,0.55)" }}>• diff {t.difficulty}</Text>
                </Text>

                <Text style={styles.cardBody}>{t.payload?.prompt_sw ?? "—"}</Text>

                <View style={styles.actions}>
                  <Pressable style={[styles.btn, styles.approve]} onPress={() => approve(t.task_id, true)}>
                    <Text style={styles.btnText}>Approve</Text>
                  </Pressable>
                  <Pressable style={[styles.btn, styles.reject]} onPress={() => approve(t.task_id, false)}>
                    <Text style={styles.btnText}>Reject</Text>
                  </Pressable>
                </View>
              </GlassCard>
            </View>
          ))}
        </View>
      )}
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 18, fontWeight: "900", color: COLORS.ink, textAlign: "center" },
  p: { marginTop: 8, fontWeight: "700", color: "rgba(28,53,87,0.75)", textAlign: "center" },

  refresh: {
    marginTop: 12,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "rgba(124,58,237,0.10)",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.35)",
  },
  refreshText: { fontWeight: "900", color: "#7C3AED" },

  err: { fontWeight: "800", color: "#B42318", textAlign: "center" },

  grid: { marginTop: 14, gap: 12 },
  gridWide: { flexDirection: "row", flexWrap: "wrap" },

  cardWrap: {},
  cardWrapWide: { width: "49%" },

  cardTitle: { fontSize: 16, fontWeight: "900", color: COLORS.ink, textAlign: "center" },
  cardBody: { marginTop: 8, fontWeight: "700", color: "rgba(28,53,87,0.75)", textAlign: "center" },

  actions: { marginTop: 12, flexDirection: "row", gap: 10, justifyContent: "center", flexWrap: "wrap" },
  btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: RADIUS.xl },
  approve: { backgroundColor: COLORS.green, borderWidth: 1, borderColor: COLORS.greenDark },
  reject: { backgroundColor: "#D64545" },
  btnText: { fontWeight: "900", color: "white" },
});
